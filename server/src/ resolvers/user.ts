import { MyContext } from "src/types";
import {
  Arg,
  Field,
  InputType,
  Query,
  Resolver,
  Mutation,
  Ctx,
  ObjectType,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import * as ERRORS from "./errors";
const COOKIE_NAME = "qid"
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return ERRORS.USERNAME_LENGTH_ERROR;
    }
    if (options.password.length <= 4) {
      return ERRORS.PASSWORD_LENGTH_ERROR;
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code == "23505" || err.details.includes("already exists")) {
        return ERRORS.USERNAME_TAKEN_ERROR;
      }
      console.log(err);
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // Find user by username
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return ERRORS.LOGIN_ERROR;
    }

    // Verify user hashed password against argument password
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return ERRORS.LOGIN_ERROR;
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Query(() => [User])
  getUsers(@Ctx() { em }: MyContext): Promise<User[] | null> {
    return em.find(User, {});
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
