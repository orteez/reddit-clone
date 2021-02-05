import React from "react";
import { Box, Link, Flex, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
interface AppNavBarProps {}

export const AppNavBar: React.FC<AppNavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer()
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  let body = null;

  if (fetching) {
    // checking if user
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" mr={2}>
            login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box mr={2} my={"auto"} color="white">
          Hello, {data.me.username}{" "}
        </Box>
        <Button
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          varient="link"
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="black" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
