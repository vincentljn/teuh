import type { Simulation } from '@prisma/client'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Anchor, Button, Card, Container, Image, Space, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

import { getSimulations } from '~/models/simulation.server'

type LoaderData = {
	simulations: Awaited<ReturnType<typeof getSimulations>>
}

export const loader: LoaderFunction = async ({ request }) => {
	const simulations = await getSimulations()

	return json<LoaderData>({ simulations })
}

export default () => {
	const loaderData = useLoaderData()

	return (
		<Container>
			<Card shadow="sm" p="lg">
				<Card.Section>
					<Image
						src="https://images.unsplash.com/photo-1551801691-f0bce83d4f68?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2370&q=80"
						height={460}
						alt="Norway"
					/>
				</Card.Section>
				<Space h="xl" />
				<Title mb="xl" order={3}>
					Welcome to Teuh
				</Title>
				<Anchor component={Link} to="/simulations" variant="text">
					<Button>View simulations</Button>
				</Anchor>
				{loaderData?.simulations && (
					<ul>
						{loaderData.simulations.map((simulation: Simulation) => (
							<li>{simulation.name}</li>
						))}
					</ul>
				)}
			</Card>
		</Container>
	)
}
