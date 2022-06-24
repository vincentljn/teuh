import type { Experience, Job, Seniority } from '@prisma/client'
import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData, useLoaderData, useTransition } from '@remix-run/react'
import { Link } from 'react-router-dom'
import { Anchor, Button, Container, Group, InputWrapper, Select, Space, TextInput, Title } from '@mantine/core'

import { requireUserId } from '~/session.server'
import { getJob, getJobs } from '~/models/job.server'
import { getExperience, getExperiences } from '~/models/experience.server'
import { getSeniorities, getSeniority } from '~/models/seniority.server'
import { calculateSalary, createSimulation } from '~/models/simulation.server'

export const meta: MetaFunction = () => ({
	title: 'New Simulation',
})

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
	const name = formData.get('name') as string
	const jobId = formData.get('job') as string
	const experienceId = formData.get('experience') as string
	const seniorityId = formData.get('seniority') as string

	if (name.length === 0) {
		return json<ActionData>({ errors: { name: 'Name is required' } }, { status: 400 })
	}

	if (jobId.length === 0) {
		return json<ActionData>({ errors: { job: 'Job is required' } }, { status: 400 })
	}

	if (experienceId.length === 0) {
		return json<ActionData>({ errors: { experience: 'Experience is required' } }, { status: 400 })
	}

	if (seniorityId.length === 0) {
		return json<ActionData>({ errors: { seniority: 'Seniority is required' } }, { status: 400 })
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
	const simulation = await createSimulation(
		{ name, jobId: Number(jobId), experienceId: Number(experienceId), seniorityId: Number(seniorityId), salary },
		userId
	)

	if (!simulation) {
		return json<ActionData>({ errors: { common: `An error occurs during simulation creation` } }, { status: 500 })
	}

	return redirect(`/simulations/${simulation.id}`)
}

export default () => {
	const transition = useTransition()
	const loaderData = useLoaderData()
	const actionData = useActionData()

	return (
		<Container>
			<Group mb="xl" position="apart">
				<Anchor component={Link} to="/simulations" size="sm">
					Back simulations
				</Anchor>
			</Group>
			<Title mb="xl" order={3}>
				New Simulation
			</Title>
			<Form method="post" action="/simulations/new">
				<InputWrapper label="Name" error={actionData?.errors.name}>
					<TextInput name="name" />
				</InputWrapper>
				<Space h="xl" />
				<InputWrapper label="Job" error={actionData?.errors.job}>
					<Select
						name="job"
						placeholder="Pick one"
						data={loaderData?.jobs.map(({ id, name }: Job) => ({ value: id, label: name }))}
					/>
				</InputWrapper>
				<Space h="xl" />
				<InputWrapper label="Experience" error={actionData?.errors.experience}>
					<Select
						name="experience"
						placeholder="Pick one"
						data={loaderData?.experiences.map(({ id, name }: Experience) => ({ value: id, label: name }))}
					/>
				</InputWrapper>
				<Space h="xl" />
				<InputWrapper label="Seniority" error={actionData?.errors.seniority}>
					<Select
						name="seniority"
						placeholder="Pick one"
						data={loaderData?.seniorities.map(({ id, name }: Seniority) => ({ value: id, label: name }))}
					/>
				</InputWrapper>
				<Space h="xl" />
				<Button type="submit">{transition.state === 'submitting' ? 'Calculating...' : 'Calculate'}</Button>
			</Form>
		</Container>
	)
}
