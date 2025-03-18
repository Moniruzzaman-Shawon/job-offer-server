const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@practiceprojects.unbpd.mongodb.net/?retryWrites=true&w=majority&appName=PracticeProjects`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");

    //job related API
    const jobsCollection = client.db('jobOffer').collection('jobs');
    const jobApplicationCollection = client.db('jobOffer').collection('job_applications')

    app.get('/jobs', async(req, res)=>{
        const cursor = jobsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/jobs/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await jobsCollection.findOne(query);
        res.send(result);
    })

    //job application API's
    //get all data || get one data|| get some data like [0||1||Many]

    app.get('/job-application', async (req,res)=>{
        const email = req.query.email;
        const query = {applicant_email: email}
        const result = await jobApplicationCollection.find(query).toArray();
        console.log(result); 

        //aggregate data (simple way)
        for(const application of result){
            console.log(application.job_id);
            const query1 = {_id: new ObjectId(application.job_id)};
            const job = await jobsCollection.findOne(query1);
            if(job){
                application.title = job.title;
                application.company = job.company;
                application.category = job.category;
                application.company_logo = job.company_logo;
                application.location = job.location;
                application.salaryRange = job.salaryRange;
                application.applicationDeadline = job.applicationDeadline;
            }
        }
            
            
        res.send(result);

    })


    app.post('/job-applications', async(req, res)=>{
        const application = req.body;
        const result = await jobApplicationCollection.insertOne(application);

        res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('Job is falling')
})

app.listen(port, ()=>{
    console.log(`Server is running at: ${port}`);
    
})