import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from 'express';
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import Redis from 'ioredis';
import session from'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";
import cors from 'cors'

import {createConnection} from 'typeorm'
import {User} from "./entities/User"
import {Post} from "./entities/Post"


declare module "express-session" {
    interface SessionData {
        userId: number;
    }
}

const main = async () => {
    await createConnection({
        type: 'postgres',
        database: 'lireddit2',
        username: "chris",
        password: "chris",
        logging: true,
        synchronize: !__prod__,
        entities: [Post, User],
        port:5432
    });

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }))

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({client: redis as any, disableTouch: true}),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax', // csrf?
                secure: __prod__, // cookie will only work in https in prod
            },
            saveUninitialized: false,
            secret: "secret",
            resave: false,
        })
    )

    console.log(__prod__)

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}): MyContext => ({req, res, redis})
    })

    apolloServer.applyMiddleware({app, cors: false})

    app.listen(4000, () => {
        console.log("server started on localhost:4000")
    });
}

main().catch(err => {
    console.error(err)
});