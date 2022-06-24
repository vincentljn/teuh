import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { useState } from 'react'
import { json } from '@remix-run/node'
import { Form, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import {
	AppShell,
	Avatar,
	Burger,
	Button,
	Group,
	Header,
	MediaQuery,
	Navbar,
	Title,
	useMantineTheme,
} from '@mantine/core'
import { useLocation } from 'react-router-dom'
import { ListNumbers, Settings, User } from 'tabler-icons-react'

import { getUser } from './session.server'

import NavItem from '~/components/layout/NavItem'

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'New Remix App',
	viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: 'https://unpkg.com/modern-css-reset@1.4.0/dist/reset.min.css',
		},
	]
}

type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>
}

export const loader: LoaderFunction = async ({ request }) => {
	return json<LoaderData>({
		user: await getUser(request),
	})
}

export default () => {
	const location = useLocation()

	const theme = useMantineTheme()

	const [opened, setOpened] = useState(false)

	const showNav = location.pathname !== '/' && location.pathname !== '/join' && location.pathname !== '/login'

	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<AppShell
					styles={{
						main: {
							background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
						},
					}}
					navbarOffsetBreakpoint="sm"
					asideOffsetBreakpoint="sm"
					fixed
					navbar={
						showNav ? (
							<Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
								<Navbar.Section>
									<NavItem label="Simulations" icon={<ListNumbers />} to="/simulations" />
									<NavItem label="Settings" icon={<Settings />} to="/settings" />
								</Navbar.Section>
							</Navbar>
						) : undefined
					}
					header={
						<Header height={70} p="md">
							<div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
								{showNav && (
									<MediaQuery largerThan="sm" styles={{ display: 'none' }}>
										<Burger
											opened={opened}
											onClick={() => setOpened((o) => !o)}
											size="xs"
											color={theme.colors.gray[6]}
											mr="xl"
										/>
									</MediaQuery>
								)}
								<Group position="apart" style={{ width: '100%' }}>
									<Title>Teuh</Title>
									<Group>
										<Form action="/logout" method="post">
											<Button type="submit">Logout</Button>
										</Form>
										<Avatar src={null} color="blue" radius="xl">
											<User />
										</Avatar>
									</Group>
								</Group>
							</div>
						</Header>
					}
				>
					<Outlet />
				</AppShell>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
