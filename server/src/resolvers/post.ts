import { Query, Resolver, Arg, Int, Mutation } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find({});
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(@Arg("title", () => String) title: string): Promise<Post> {
    // 2 sql queries...
    return Post.create({ title }).save();
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      Post.update({id}, {title})
    }
    return post;
  }

  @Mutation(() => Post)
  async deletePost(
    @Arg("id", () => Int) id: number
  ): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
