import React from "react";
import { Formik, Form } from "formik";
import {
  FormControl,
  Box,
  Button,
  Link,
  Flex,
} from "@chakra-ui/react";
import NextLink from 'next/link'
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorsMap";
import {useRouter} from "next/router";
import { withUrqlClient } from "next-urql";
import { creatUrqlClient } from "../utils/createUrqlClient";

const Login: React.FC<{}> = ({}) => {
    const router = useRouter()
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push("/")
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
              <InputField
                name="usernameOrEmail"
                placeholder="username or email"
                label="Username or email"
              />
              <Box mt={4}>
                <InputField
                  name="password"
                  placeholder="password"
                  label="Password"
                  type="password"
                />
              </Box>
              <Flex mt={2}>
                <NextLink href="/forgot-password">
                  <Link  ml="auto"href="/forgot-password">forgot password?</Link>
                </NextLink>                
              </Flex>
            </FormControl>
            <Button
              mt={2}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="teal"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(creatUrqlClient, { ssr: false })(Login);
