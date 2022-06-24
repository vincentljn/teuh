import { Anchor, Button, Card, Container, Image, Space, Title, useMantineTheme } from '@mantine/core'
import { Link } from 'react-router-dom'

export default function Index() {
	const theme = useMantineTheme()

	const secondaryColor = theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7]

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
			</Card>
		</Container>
	)
}
