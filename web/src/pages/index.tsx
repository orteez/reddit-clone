import { withUrqlClient } from "next-urql";
import { AppNavBar } from "../components/AppNavBar";
import { usePostsQuery } from "../generated/graphql";
import { creatUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <AppNavBar />
      <div>Hello World!</div>
      <br/>
      {!data ? null : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </>
  );
};

export default withUrqlClient(creatUrqlClient, { ssr: true })(Index);
