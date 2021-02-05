import { FormControl, Box, Button, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorsMap";
import { useChangePasswordMutation } from "../../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { creatUrqlClient } from "../../utils/createUrqlClient";
import NextLink from "next/link"
const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            token: token,
            password: values.password,
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) {
              setTokenError(errorMap["token"] as any);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
              <InputField
                name="password"
                placeholder="New password"
                label="New Password"
                type="password"
              />
            </FormControl>
            {tokenError ? (
              <Box color="red">
                {tokenError}
                <NextLink href="/forgot-password">
                  <Link >forgot password</Link>
                </NextLink>
              </Box>
            ) : (
              ""
            )}
            <Button
              mt={8}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="teal"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(creatUrqlClient, { ssr: false })(ChangePassword);
