import type { Experience, Job, Seniority } from '@prisma/client'
import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData, useLoaderData, useTransition } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
	Affix,
	Anchor,
	Button,
	Container,
	Group,
	Input,
	InputWrapper,
	Notification,
	Paper,
	Select,
	Space,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { Check } from 'tabler-icons-react'

import { requireUserId } from '~/session.server'
import { calculateSalary, getSimulation, updateSimulation } from '~/models/simulation.server'
import { getJob, getJobs } from '~/models/job.server'
import { getExperience, getExperiences } from '~/models/experience.server'
import { getSeniorities, getSeniority } from '~/models/seniority.server'

import { formatCurrency } from '~/utils'

export const meta: MetaFunction = () => ({
	title: 'Test',
})

type LoaderData = {
	simulation: Awaited<ReturnType<typeof getSimulation>>
	jobs: Awaited<ReturnType<typeof getJobs>>
	experiences: Awaited<ReturnType<typeof getExperiences>>
	seniorities: Awaited<ReturnType<typeof getSeniorities>>
}

export const loader: LoaderFunction = async ({ params, request }) => {
	const userId = await requireUserId(request)

	const simulation = await getSimulation({ id: Number(params.id) }, userId)
	if (!simulation) {
		throw new Response(`Simulation ${params.id} not found`, { status: 404 })
	}

	const jobs = await getJobs()
	const experiences = await getExperiences()
	const seniorities = await getSeniorities()

	return json<LoaderData>({ simulation, jobs, experiences, seniorities })
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
	const id = Number(formData.get('id'))

	const message = 'The simulation has been successfully updated'
	switch (intent) {
		case 'refresh': {
			const simulation = await getSimulation({ id }, userId, true)
			const salary = await calculateSalary(simulation)
			await updateSimulation({
				...simulation,
				salary,
			})
			break
		}
		case 'calculate': {
			const name = formData.get('name') as string
			const jobId = Number(formData.get('job'))
			const experienceId = Number(formData.get('experience'))
			const seniorityId = Number(formData.get('seniority'))

			if (name.length === 0) {
				return json<ActionData>({ errors: { name: 'Name is required' } }, { status: 400 })
			}

			const job = await getJob(Number(jobId))
			if (!job) {
				return json<ActionData>({ errors: { common: `Job ${jobId} not found` } }, { status: 404 })
			}

			const experience = await getExperience(Number(experienceId))
			if (!experience) {
				return json<ActionData>({ errors: { common: `Experience ${experienceId} not found` } }, { status: 404 })
			}

			const seniority = await getSeniority(Number(seniorityId))
			if (!seniority) {
				return json<ActionData>({ errors: { common: `Seniority ${seniorityId} not found` } }, { status: 404 })
			}

			const salary = await calculateSalary({
				job,
				experience,
				seniority,
			})
			await updateSimulation({
				id,
				name,
				jobId,
				experienceId,
				seniorityId,
				salary,
			})
		}
	}

	return json<ActionData>({ message })
}

export default () => {
	const [hasNotification, setHasNotification] = useState(false)

	const transition = useTransition()
	const location = useLocation()
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
				<Anchor component={Link} to="/simulations" size="sm">
					Back simulations
				</Anchor>
			</Group>
			<Title mb="xl" order={3}>
				{loaderData?.simulation.name}
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
			{(location.state as { from: string })?.from && (
				<>
					<Anchor component={Link} to={(location.state as { from: string })?.from} variant="text" size="sm">
						<Button>Cancel</Button>
					</Anchor>
					<Space h="xl" />
				</>
			)}
			<Group grow={true} align="start">
				<Paper shadow="md" p="xl">
					<Form id="form" method="post" action={`/simulations/edit/${loaderData?.simulation.id}`}>
						<Input type="hidden" name="id" value={loaderData?.simulation.id} />
						<InputWrapper label="Name" error={actionData?.errors?.name}>
							<TextInput name="name" defaultValue={loaderData?.simulation.name} />
						</InputWrapper>
						<Space h="xl" />
						<InputWrapper label="Job" error={actionData?.errors?.job}>
							<Select
								name="job"
								placeholder="Pick one"
								data={loaderData?.jobs.map(({ id, name }: Job) => ({ value: id.toString(), label: name }))}
								defaultValue={loaderData?.simulation.jobId.toString()}
							/>
						</InputWrapper>
						<Space h="xl" />
						<InputWrapper label="Experience" error={actionData?.errors?.experience}>
							<Select
								name="experience"
								placeholder="Pick one"
								data={loaderData?.experiences.map(({ id, name }: Experience) => ({
									value: id.toString(),
									label: name,
								}))}
								defaultValue={loaderData?.simulation.experienceId.toString()}
							/>
						</InputWrapper>
						<Space h="xl" />
						<InputWrapper label="Seniority" error={actionData?.errors?.seniority}>
							<Select
								name="seniority"
								placeholder="Pick one"
								data={loaderData?.seniorities.map(({ id, name }: Seniority) => ({
									value: id.toString(),
									label: name,
								}))}
								defaultValue={loaderData?.simulation.seniorityId.toString()}
							/>
						</InputWrapper>
						<Space h="xl" />
						<Button type="submit" form="form" name="intent" value="calculate">
							{transition.state === 'submitting' && transition.submission.formData.get('intent') === 'calculate'
								? 'Calculating...'
								: 'Calculate'}
						</Button>
					</Form>
				</Paper>
				<Paper shadow="md" p="xl">
					<Title order={4}>Salary</Title>
					<Text>{formatCurrency(loaderData?.simulation.salary)}</Text>
					<Space h="xl" />
					<Form
						method="delete"
						onSubmit={(event) => {
							if (!confirm('This will update the salary with the current settings values.\nAre you sure?')) {
								event.preventDefault()
							}
						}}
					>
						<Input type="hidden" name="id" value={loaderData?.simulation.id} />
						<Button type="submit" name="intent" value="refresh">
							{transition.state === 'submitting' && transition.submission.formData.get('intent') === 'refresh'
								? 'Refreshing...'
								: 'Refresh'}
						</Button>
					</Form>
				</Paper>
			</Group>
		</Container>
	)
}
