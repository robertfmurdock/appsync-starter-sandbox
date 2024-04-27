import {CONNECTION_STATE_CHANGE, ConnectionState, generateClient} from "@aws-amplify/api";
import {Amplify} from "aws-amplify";
import {Hub} from 'aws-amplify/utils';
import {describe, it} from "node:test";
import {createAuthLink} from "aws-appsync-auth-link";
import {createSubscriptionHandshakeLink} from "aws-appsync-subscription-link";
import {
    gql,
    ApolloClient,
    InMemoryCache,
    HttpLink,
    ApolloLink,
} from "@apollo/client/core";

Object.assign(global, { WebSocket: require('ws') });

const url = "http://localhost:4000/graphql";
const region = "us-east-2"
const auth = {
    type: "API_KEY",
    apiKey: "da2-fakeApiId123456",
    // jwtToken: async () => token, // Required when you use Cognito UserPools OR OpenID Connect. token object is obtained previously
    // credentials: async () => credentials, // Required when you use IAM-based auth.
};

const httpLink = new HttpLink({uri: url});

const link = ApolloLink.from([
    createAuthLink({url, region, auth}),
    createSubscriptionHandshakeLink({url, region, auth}, httpLink),
]);

const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
});

Amplify.configure({
    API: {
        GraphQL: {
            defaultAuthMode: "apiKey",
            endpoint: "http://localhost:4000/graphql",
            apiKey: "da2-fakeApiId123456"
        }
    },
});

Hub.listen('api', (data) => {
    const {payload} = data;
    if (payload.event === CONNECTION_STATE_CHANGE) {
        const connectionState = payload.data.connectionState;
        console.log(JSON.stringify(payload.message));
        console.log(connectionState);
    } else {
        console.log("api call", JSON.stringify(payload))
    }
});

const client = generateClient();

describe("lol", () => {
    it("lol", async () => {
        // console.log("lol")
        //
        // const sub = client
        // .graphql({
        //     query: gql`subscription MySubscription {    onAddBook {   title       }  }  `,
        //     variables: {}
        // })
        // .subscribe({
        //     next: ({data}) => console.log(data),
        //     error: (error) => console.warn(error)
        // });
        // console.log("sub", sub)


        await new Promise((resolve) => {
            const observable = apolloClient.subscribe({
                query: gql`subscription MySubscription {    onAddBook {   title       }  }`,
            })

            let count = 0
            const subscription = observable.subscribe((result) => {
                console.log("result", result)
                count++
                if(count ===3) {
                    subscription.unsubscribe()
                    resolve()
                }
            })
        })
    })
})