import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLocation } from 'react-router-dom'
import { useLoaderData } from '@remix-run/react'
import { Anchor, Button, Container, Group, Paper, Space, Stack, Text, Title } from '@mantine/core'

import { getSimulation } from "~/models/simulation.server"
import { requireUserId } from '~/session.server'
import { formatCurrency } from '~/utils'

type LoaderData = {
	simulation: Awaited<ReturnType<typeof getSimulation>>
}

export const loader: LoaderFunction = async ({ params, request }) => {
	const userId = await requireUserId(request)

	const simulation = await getSimulation({ id: Number(params.id) }, userId, true)
	if (!simulation) {
		throw new Response(`Simulation ${params.id} not found`, { status: 404 })
	}

	return json<LoaderData>({ simulation })
}

export default () => {
	const location = useLocation()
	const loaderData = useLoaderData()

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
			<Group grow={true} align="start">
				<Paper shadow="md" p="xl">
					<Stack spacing="xs">
						<Title order={4}>Job</Title>
						<Text>{loaderData?.simulation.job.name}</Text>
					</Stack>
					<Space h="xl" />
					<Stack spacing="xs">
						<Title order={4}>Experience</Title>
						<Text>{loaderData?.simulation.experience.name}</Text>
					</Stack>
					<Space h="xl" />
					<Stack spacing="xs">
						<Title order={4}>Seniority</Title>
						<Text>{loaderData?.simulation.seniority.name}</Text>
					</Stack>
				</Paper>
				<Paper shadow="md" p="xl">
					<Title order={4}>Salary</Title>
					<Text>{formatCurrency(loaderData?.simulation.salary)}</Text>
				</Paper>
			</Group>
			<Space h="xl" />
			<Anchor
				component={Link}
				to={`/simulations/edit/${loaderData?.simulation.id}`}
				state={{ from: location.pathname }}
				variant="text"
				size="sm"
			>
				<Button>Edit</Button>
			</Anchor>
		</Container>
	)
}
