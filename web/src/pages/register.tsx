import React from "react";
import { Formik, Form } from "formik";
import {
  FormControl,
  Box,
  Button,
} from "@chakra-ui/react";

import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorsMap";
import {useRouter} from "next/router";
import { withUrqlClient } from "next-urql";
import { creatUrqlClient } from "../utils/createUrqlClient";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter()
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({options: values});
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push("/")
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
              <InputField
                name="username"
                placeholder="username"
                label="Username"
              />
              <Box mt={4}>
                <InputField
                  name="email"
                  placeholder="email"
                  label="email"
                  type="email"
                />
              </Box>
              <Box mt={4}>
                <InputField
                  name="password"
                  placeholder="password"
                  label="Password"
                  type="password"
                />
              </Box>
            </FormControl>
            <Button
              mt={8}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="teal"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(creatUrqlClient, { ssr: false })(Register);
