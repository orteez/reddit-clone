import React, { useState } from "react";
import { Formik, Form } from "formik";
import { FormControl, Box, Button } from "@chakra-ui/react";

import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useForgotPasswordMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { creatUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [, forgotPassowrd] = useForgotPasswordMutation();
  const [isValidRequest, setValidRequest] = useState(false);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassowrd(values);
          setValidRequest(true);
        }}
      >
        {({ isSubmitting }) =>
          isValidRequest ? (
            <Box>Check email for link to change password...</Box>
          ) : (
            <Form>
              <FormControl>
                <InputField
                  name="email"
                  placeholder="email"
                  label="email"
                  type="email"
                />
              </FormControl>
              {!isValidRequest ? <Box>Could not process...</Box> : ""}
              <Button
                mt={8}
                isLoading={isSubmitting}
                type="submit"
                colorScheme="teal"
              >
                Forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(creatUrqlClient, { ssr: false })(ForgotPassword);
