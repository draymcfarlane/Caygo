import { Stack, Link } from 'expo-router';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Login' }} />
      <Container>
        <ScreenContent path="app/index.tsx" title="Login"></ScreenContent>
        <Link href={{ pathname: '/bgmap', params: { name: 'Dray' } }} asChild>
          <Button title="Show Details" />
        </Link>
      </Container>
    </>
  );
}