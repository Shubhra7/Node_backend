import express from 'express';
const app = express();

// app.use(express.static('dist'));

// app.get('/',(req,res)=>{
//     res.send('Server is ready');
// })

// '/api' ==> for CORS standardrization

app.get('/api/jokes',(req,res)=>{
    const jokes=[
        {
            id:1,
            title:'A joke',
            content: 'This is joke'
        },
        {
            id:2,
            title:'A joke2',
            content: 'This is joke2'
        },
        {
            id:3,
            title:'A joke3',
            content: 'This is joke3'
        },{
            id:4,
            title:'A joke4',
            content: 'This is joke4'
        },{
            id:5,
            title:'A joke5',
            content: 'This is joke5'
        }
    ];
    res.send(jokes);

})

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Serve at http://localhost:${port}`);
    
})