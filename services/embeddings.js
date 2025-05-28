import {pinecone} from "./pinecone.js";
import {v4 as uuidv4} from "uuid";
import {OpenAI} from "openai";
import axios from "axios";
const openai=new OpenAI({
    baseURL:process.env.OPENAI_API_URL,
    apiKey:process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
}

const indexName=pinecone.Index('employee-demo-rag2');
const db=indexName.namespace('employees')


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

export async function UpsertEmbeddings(text,employeeData,isInitial=false){
   
    const uuid=uuidv4();
 

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
    if(!text){
        throw new Error("Text not found to generate embeddings");
       }
        const embedding = await getEmbeddings(text);
        await db.upsert([{
            id: uuid,
            values: embedding,
            metadata: {
                    name:employeeData.name,
                    email:employeeData.email,
                    role:employeeData.role,
                    department:employeeData.department,
                    skills:employeeData.skills
                }
            }]
        );
        console.log(`Employee ${uuid} added to Pinecone`);
        return text;
   }
}


export async function queryEmbeddings(textQuery){

    if(!textQuery){
        throw new Error("Text query not found to query embeddings");
    }
    const embedding=await getEmbeddings(textQuery);

    const results = await db.query({
        topK: 10,
        vector:embedding,
        includeMetadata:true

      });
      const employeeData=results.matches.map(hit=>hit.metadata);
    return employeeData;
}

export async function getLLMResponse(employeeData, textQuery, conversationHistory = []){
    const systemPrompt = `You are a helpful assistant that can answer questions about the employees in the company.
    Here is the data about all the company employees:
    ${JSON.stringify(employeeData)}
    
    Maintain a conversational tone and use the conversation history to provide context-aware responses.`;

    const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: textQuery }
    ];

    const response = await openai.chat.completions.create({
        model: "gemma3:4b-it-qat",
        messages: messages,
        stream: false,
    });
    console.log('Assistant response', response);
    return response.choices[0].message.content;
}
