import type { Job, Simulation } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, NavLink, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
	ActionIcon,
	Affix,
	Anchor,
	Button,
	Container,
	Group,
	Input,
	Notification,
	Stack,
	Table,
	Text,
	Title,
	Tooltip,
} from '@mantine/core'
import { BoxOff, Check, Edit, Plus, Refresh, Trash } from 'tabler-icons-react'

import { requireUserId } from '~/session.server'
import {
	calculateSalary,
	deleteSimulation,
	getSimulation,
	getSimulations,
	updateSimulation,
} from '~/models/simulation.server'

type LoaderData = {
	simulations: Awaited<ReturnType<typeof getSimulations>>
}

export const loader: LoaderFunction = async ({ request }) => {
	const userId = await requireUserId(request)

	const simulations = await getSimulations(userId)

	return json<LoaderData>({ simulations })
}

type ActionData = {
	message?: string
}

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request)

	const formData = await request.formData()
	const intent = formData.get('intent')
	const id = Number(formData.get('id'))

	let message = ''
	switch (intent) {
		case 'refresh':
			const simulation = await getSimulation({ id }, userId, true)
			const salary = await calculateSalary(simulation)
			await updateSimulation({
				...simulation,
				salary,
			})
			message = 'The simulation has been successfully updated'
			break
		case 'delete':
			await deleteSimulation({ id: Number(id) })
			message = 'The simulation has been successfully deleted'
	}

	return json<ActionData>({ message })
}

export default () => {
	const [hasNotification, setHasNotification] = useState(false)

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
				<Button component={Link} to="/simulations/new" leftIcon={<Plus size={14} />}>
					New Simulation
				</Button>
			</Group>
			<Title mb="xl" order={3}>
				Simulations
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
			<Stack>
				{loaderData?.simulations.length === 0 ? (
					<Stack align="center" spacing="xs">
						<BoxOff size={72} />
						<Text size="md">No simulations yet</Text>
						<Anchor component={Link} to="new" size="sm">
							Create a simulation
						</Anchor>
					</Stack>
				) : (
					<Table fontSize="sm" highlightOnHover>
						<thead>
							<tr>
								<th style={{ width: '50%' }}>
									<Text size="xs" transform="uppercase">
										Name
									</Text>
								</th>
								<th style={{ width: '20%' }}>
									<Text size="xs" transform="uppercase">
										Job
									</Text>
								</th>
								<th style={{ width: '20%' }}>
									<Text size="xs" transform="uppercase">
										Salary
									</Text>
								</th>
								<th />
								<th />
							</tr>
						</thead>
						<tbody>
							{loaderData?.simulations.map((simulation: Simulation & { job: Job }) => {
								const salary = simulation.salary
									? new Intl.NumberFormat('fr-FR', {
											style: 'currency',
											currency: 'EUR',
											maximumFractionDigits: 0,
									  }).format(simulation.salary)
									: 0
								return (
									<tr key={simulation.id}>
										<td>
											<Anchor component={Link} to={`/simulations/${simulation.id}`} size="sm">
												{simulation.name}
											</Anchor>
										</td>
										<td>{simulation.job.name}</td>
										<td>{salary}</td>
										<td>
											<Form
												method="post"
												onSubmit={(event) => {
													if (!confirm('Are you sure?')) {
														event.preventDefault()
													}
												}}
											>
												<Input name="id" type="hidden" value={simulation.id} />
												<Tooltip label="Refresh" withArrow>
													<ActionIcon type="submit" name="intent" value="refresh">
														<Refresh />
													</ActionIcon>
												</Tooltip>
											</Form>
										</td>
										<td>
											<NavLink to={`/simulations/edit/${simulation.id}`}>
												<Tooltip label="Edit" withArrow>
													<ActionIcon>
														<Edit />
													</ActionIcon>
												</Tooltip>
											</NavLink>
										</td>
										<td>
											<Form
												method="delete"
												onSubmit={(event) => {
													if (!confirm('Are you sure?')) {
														event.preventDefault()
													}
												}}
											>
												<Input name="id" type="hidden" value={simulation.id} />
												<Tooltip label="Delete" withArrow>
													<ActionIcon type="submit" name="intent" value="delete">
														<Trash />
													</ActionIcon>
												</Tooltip>
											</Form>
										</td>
									</tr>
								)
							})}
						</tbody>
					</Table>
				)}
			</Stack>
		</Container>
	)
}
