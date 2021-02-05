import { MyContext } from "src/types";
import {
  Arg,
  Field,
  Query,
  Resolver,
  Mutation,
  Ctx,
  ObjectType,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import * as ERRORS from "../utils/errors";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmails";
import { v4 } from "uuid";
import { FORGET_PASSWORD_PREFIX, COOKIE_NAME } from "../constants";
import { getConnection } from "typeorm";
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
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("password") password: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (password.length <= 2) {
      return ERRORS.PASSWORD_LENGTH_ERROR;
    }

    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);

    if (!userId) {
      return ERRORS.LOGIN_ERROR;
    }
    const id = parseInt(userId);
    const user = await User.findOne(id);

    if (!user) {
      return ERRORS.LOGIN_ERROR;
    }

    await User.update({ id: id }, { password: await argon2.hash(password) });

    await redis.del(FORGET_PASSWORD_PREFIX + token);

    // log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return false;
    }
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      15 * 1000 * 60
    );
    const link = `<a href="http://localhost:3000/change-password/${token}">reset password</a>`;
    await sendEmail(email, link);

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    if (!req.session.userId) {
      return undefined;
    }

    return await User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return errors;
    }

    const hashedPassword = await argon2.hash(options.password);
    let user = new User();
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // Find user by username
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return ERRORS.LOGIN_ERROR;
    }

    // Verify user hashed password against argument password
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return ERRORS.LOGIN_ERROR;
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Query(() => [User])
  getUsers(): Promise<User[] | null> {
    return User.find();
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
