const app = require('express')();

const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: "" });

const {
    Get,
    Ref,
    Collection,
    Create,
    Select, Match, Index,
    Paginate,
    Call,
    Function: Fn,
    Join
    
} = faunadb.query;

app.get('/tweet/:id', async (req, res) => {
    const doc = await client.query(
        Get(
            Ref(
                Collection('tweets'),
                req.params.id
            )
        )
    )
        .catch(e => res.send(e));

    res.send(doc);
})

app.post('/tweet', async (req, res) => {
    const data = {
        user: Call(Fn('getUser'), 'bob'),
        text: 'Hola mundo'
    };

    const doc = await client.query(
        Create(
            Collection('tweets'),
            {data}
        )
    )
    res.send(doc)
})

app.get('/tweet', async (req, res) => {
    const docs = await client.query(
        Paginate(
            Match(
                Index('tweets_by_user'),
                Call(Fn('getUser'), 'tom')
                )
            )
        )
    
    res.send(docs);
})

app.post('/relationship', async (req, res) => {
    const data = {
        follower: Call(Fn('getUser'), 'bob'),
        followee: Call(Fn('getUser'), 'tom')
    }
    const doc = await client.query(
        Create(
            Collection('relationships'),
            { data }
        )
    )
    .catch(e => res.send(e))
    res.send(doc)
})

app.get('/feed', async (req, res) => {
    const docs = await client.query(
        Paginate(
            Join(
                Match(
                    Index('followers_by_followee'),
                    Call(Fn('getUser'), 'bob')
                ),
                Index('tweets_by_user')
            )
        )
    ).catch(e => res.send(e))
    res.send(docs)
})

app.listen(5000, () => console.log('Listening on 5000'));
