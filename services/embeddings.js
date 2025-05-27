import {pinecone, index} from "./pinecone.js";
import {v4 as uuidv4} from "uuid";
import {OpenAI} from "openai";
import axios from "axios";
const openai=new OpenAI({
    baseURL:"http://localhost:11434/v1",
    apiKey:"sk-proj-1234567890",
});


export const DUMMY_EMPLOYEES=[
    {
        id:1,
        name:"John Doe",
        email:"john.doe@example.com",
        role:"Software Engineer",
        department:"Engineering",
        skills:"JavaScript, Python, React"
    },
    {
        id:2,
        name:"Jane Smith",
        email:"jane.smith@example.com",
        role:"Product Manager",
        department:"Product",
        skills:"Product Management, Agile, Scrum"
    },
    {
        id:3,
        name:"Michael Brown",
        email:"michael.brown@example.com",
        role:"Data Analyst",
        department:"Data",
        skills:"SQL, Python, Data Visualization"
    },
    {
        id:4,
        name:"Emily Davis",
        email:"emily.davis@example.com",
        role:"Marketing Specialist",
        department:"Marketing",
        skills:"Digital Marketing, Social Media, Content Creation"
    },
    {
        id:5,
        name:"Robert Wilson",
        email:"robert.wilson@example.com",
        role:"Sales Manager",
        department:"Sales",
        skills:"Sales, Marketing, Customer Service"
    }
]

export async function getEmbeddings(text){
    try{
        const response=await axios.post('http://localhost:11434/api/embed',{
            model:"mxbai-embed-large:latest",
            input:JSON.stringify(text),
        });
        console.log('response from axios',response.data.embeddings[0]);
        return response.data.embeddings[0];
    }catch(error){
        console.error('Error generating embeddings:', error);
        throw error;
    }
}

export async function UpsertEmbeddings(text,isInitial=false){
    const indexName=pinecone.Index('employee-demo-rag2');
    const db=indexName.namespace('employees')
    const uuid=uuidv4();
   if(!index){
    throw new Error("Index not found");
   }
   if(!text){
    throw new Error("Text not found to generate embeddings");
   }

   if(isInitial){
    const employeeTexts=[];
    for(const employee of text){
        const employeeText=`
        ID: ${employee.id}
        Name: ${employee.name}  
        Email: ${employee.email}
        Role: ${employee.role}
        Department: ${employee.department}
        Skills: ${(employee.skills || '').split(',').map(skill=>`- ${skill}`).join('\n')}
        `
        const embedding = await getEmbeddings(employeeText);
        await db.upsert(
            [{
                id: employee.id.toString(),
                values: embedding,
                metadata: {
                    name: employee.name,
                    email: employee.email,
                    role: employee.role,
                    department: employee.department,
                    skills: employee.skills
                }
            }]
        );
        console.log(`Initial Employee ${employee.id} added to Pinecone`);
            employeeTexts.push(employeeText);
    }
    return employeeTexts;
   }else{
        const embedding = await getEmbeddings(text);
        await db.upsert([{
            id: uuid,
            values: embedding,
            metadata: {
                    text: text
                }
            }]
        );
        console.log(`Employee ${uuid} added to Pinecone`);
        return text;
   }
}


export async function queryEmbeddingsEmployee(textQuery){

    const index=pinecone.Index(index);
    if(!index){
        throw new Error("Index not found");
    }

    const results = await index.searchRecords({
        query: {
          topK: 10,
            inputs: { text: textQuery },
        },
      });
      console.log('results from pinecone query embeddings',results);
      // Print the results
      results.result.hits.forEach(hit => {
        console.log(`id: ${hit.id}`);
      });
    
}

export async function getLLMResponse(text,contextChunks){
    const adjustedPrompt=`
    You are a helpful assistant that can answer questions about the employees in the company.
    You are given a question and you need to answer it based on the information provided.
    ${text}
    `
    const response=await openai.chat.completions.create({
        model:"gemma3:4b-it-qat",
        messages:[{role:"user",content:adjustedPrompt}],
        stream:false,
    });
   console.log('response from gemma3',response);
   return response.choices[0].message.content;
}


export async function queryEmbeddings(queryVec){
    const index=pinecone.Index(index);
    if(!index){
        throw new Error("Index not found");
    }
    const results=await index.queryRecords({
        query:queryVec,
        topK:10,
        includeValues:true,
    });
    return results.result.hits;
}
