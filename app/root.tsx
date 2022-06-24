import type { LinksFunction, MetaFunction } from '@remix-run/node'
import { Form, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import { AppShell, Avatar, Burger, Button, Group, Header, MediaQuery, Navbar, Title } from '@mantine/core'
import { ListNumbers, Settings, User } from 'tabler-icons-react'
import NavItem from '~/components/layout/NavItem'
import { useState } from 'react'

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

export default () => {
	const [opened, setOpened] = useState(false)

	const showNav = true

	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<AppShell
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
										<Burger opened={opened} onClick={() => setOpened((o) => !o)} size="xs" mr="xl" />
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
