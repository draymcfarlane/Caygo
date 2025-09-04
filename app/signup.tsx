import { Stack, useLocalSearchParams } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function SignUp() {
  const { name } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: 'Sign Up' }} />
      <Container>
        <ScreenContent path="screens/signup.tsx" title={`Showing details for user ${name}`} />
      </Container>
    </>
  );
}
