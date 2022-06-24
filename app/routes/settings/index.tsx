import type { Experience, Job, Seniority } from '@prisma/client'
import type { ActionFunction, LinksFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Fragment, useEffect, useState } from 'react'
import { Form, useActionData, useLoaderData, useTransition } from '@remix-run/react'
import { Link } from 'react-router-dom'
import {
	Affix,
	Anchor,
	Button,
	Container,
	Group,
	InputWrapper,
	Notification,
	NumberInput,
	Space,
	Title,
} from '@mantine/core'
import { Check, Refresh } from 'tabler-icons-react'

import { getJobs, updateJob } from '~/models/job.server'
import { getExperiences, updateExperience } from '~/models/experience.server'
import { getSeniorities, updateSeniority } from '~/models/seniority.server'

import styles from '../../app.css'
import { calculateSalary, getSimulation, getSimulations, updateSimulation } from "~/models/simulation.server";
import { requireUserId } from "~/session.server";

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styles }]
}

type LoaderData = {
	jobs: Awaited<ReturnType<typeof getJobs>>
	experiences: Awaited<ReturnType<typeof getExperiences>>
	seniorities: Awaited<ReturnType<typeof getSeniorities>>
}

export const loader: LoaderFunction = async () => {
	const jobs = await getJobs()
	const experiences = await getExperiences()
	const seniorities = await getSeniorities()

	return json<LoaderData>({ jobs, experiences, seniorities })
}

type ActionData = {
	errors?: {
		common?: string
		name?: string
		job?: string
		experience?: string
		seniority?: string
	}
	message?: string
}

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request)

	const formData = await request.formData()
	const intent = formData.get('intent')

	let message: string = ''
	switch (intent) {
		case 'refresh': {
			const simulations = await getSimulations(userId)
			await Promise.all([simulations.map(async (simulation) => {
				const salary = await calculateSalary(simulation);
				await updateSimulation({
					...simulation,
					salary,
				})
			})])
			message = 'All the simulations has been successfully updated'
			break
		}
		case 'save': {
			const jobs = []
			const experiences = []
			const seniorities = []
			for (let [key, value] of formData.entries()) {
				if (key === 'intent') continue
				const split = key.split('_')
				switch (split[0]) {
					case 'job':
						jobs.push({ id: Number(split[1]), value: Number(value) })
						break
					case 'experience':
						experiences.push({ id: Number(split[1]), value: Number(value) })
						break
					case 'seniority':
					default:
						seniorities.push({ id: Number(split[1]), value: Number(value) })
				}
			}

			await Promise.all([jobs.map(async (job) => await updateJob(job))])
			await Promise.all([experiences.map(async (experience) => await updateExperience(experience))])
			await Promise.all([seniorities.map(async (seniority) => await updateSeniority(seniority))])

			message = 'The settings have been successfully updated'
		}
	}

	return json<ActionData>({ message })
}

export default () => {
	const [hasNotification, setHasNotification] = useState(false)

	const transition = useTransition()
	const loaderData = useLoaderData()
	const actionData = useActionData()

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>
		if (actionData?.message) {
			setHasNotification(true)
			timeout = setTimeout(() => setHasNotification(false), 5000)
		}
		return () => clearTimeout(timeout)
	}, [actionData])

	return (
		<Container>
			<Group mb="xl" position="apart">
				<Anchor component={Link} to="/" size="sm">
					Back home
				</Anchor>
				<Form
					method="delete"
					onSubmit={(event) => {
						if (!confirm('This will update all simulations with the current settings values.\nAre you sure?')) {
							event.preventDefault()
						}
					}}
				>
					<Button type="submit" name="intent" value="refresh" leftIcon={<Refresh size={14} />}>
						{transition.state === 'submitting' && transition.submission.formData.get('intent') === 'refresh'
							? 'Refreshing...'
							: 'Refresh All Simulations'}
					</Button>
				</Form>
			</Group>
			<Title mb="xl" order={3}>
				Settings
			</Title>
			{hasNotification && (
				<Affix position={{ top: 10, right: 10 }}>
					<Notification
						color="teal"
						icon={<Check size={18} />}
						title="Congrats!"
						onClose={() => setHasNotification(false)}
					>
						{actionData.message}
					</Notification>
				</Affix>
			)}
			<Form method="post">
				<Group grow={true}>
					<fieldset>
						<legend>
							<Title order={4}>Jobs</Title>
						</legend>
						{loaderData?.jobs.map(({ id, name, value }: Job) => (
							<Fragment key={id}>
								<Space h="xs" />
								<InputWrapper label={name}>
									<NumberInput name={`job_${id}`} defaultValue={value} min={0} step={500} />
								</InputWrapper>
							</Fragment>
						))}
						<Space h="xs" />
					</fieldset>
					<fieldset>
						<legend>
							<Title order={4}>Experiences</Title>
						</legend>
						{loaderData?.experiences.map(({ id, name, value }: Experience) => (
							<Fragment key={id}>
								<Space h="xs" />
								<InputWrapper label={name}>
									<NumberInput name={`experience_${id}`} defaultValue={value} min={0} precision={1} step={0.1} />
								</InputWrapper>
							</Fragment>
						))}
						<Space h="xs" />
					</fieldset>
					<fieldset>
						<legend>
							<Title order={4}>Seniorities</Title>
						</legend>
						{loaderData?.seniorities.map(({ id, name, value }: Seniority) => (
							<Fragment key={id}>
								<Space h="xs" />
								<InputWrapper label={name}>
									<NumberInput name={`seniority_${id}`} defaultValue={value} min={0} step={50} />
								</InputWrapper>
							</Fragment>
						))}
						<Space h="xs" />
					</fieldset>
				</Group>
				<Space h="xl" />
				<Button type="submit" name="intent" value="save">
					{transition.state === 'submitting' && transition.submission.formData.get('intent') === 'save' ? 'Saving...' : 'Save'}
				</Button>
			</Form>
		</Container>
	)
}
