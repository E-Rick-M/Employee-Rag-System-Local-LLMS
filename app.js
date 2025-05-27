import readline from "readline";
import {UpsertEmbeddings,getLLMResponse,getEmbeddings,queryEmbeddings} from "./services/embeddings.js";
import {DUMMY_EMPLOYEES} from "./services/embeddings.js";
let isInitial=true;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function askQuestion(questionAsked) {
    return new Promise((resolve) => {
        rl.question(questionAsked, (questionAsked) => {
            resolve(questionAsked);
        });
    });
}


async function main() {
    console.log("Welcome to the Employee RAG system");
    console.log('--------------------------------');
    const mode=await askQuestion(`Enter the mode (1 : add , 2 : search): `);
    if(mode==="1"){

        // if(isInitial){
        //     const response=await UpsertEmbeddings(DUMMY_EMPLOYEES,true);
        //     console.log('response from upsert embeddings',response);
        //     isInitial=false;
        //     return;
        // }

        const id=await askQuestion("Enter the employee id: ");
        const name=await askQuestion("Enter the employee name: ");
        const email=await askQuestion("Enter the employee email: ");
        const role=await askQuestion("Enter the employee role: ");
        const department=await askQuestion("Enter the employee department: ");
        const skills=await askQuestion("Enter the employee skills Comma separated: ");

        const employeeText=`
        ID: ${id}
        Name: ${name}
        Email: ${email}
        Role: ${role}
        Department: ${department}
        Skills: ${skills.split(',').map(skill=>`- ${skill}`)}
        `
    
        const response=await UpsertEmbeddings(employeeText);
        console.log('response from upsert embeddings',response);
    }else if(mode==="2"){
        const question=await askQuestion("Enter the question to query: ");
        const queryVec=await getEmbeddings(question);
        const results=await queryEmbeddings(queryVec);
        const contextChunks=results.map(result=>JSON.stringify(result));
        const response=await getLLMResponse(question,contextChunks);
        console.log('response from get response',response);
    }else{
        console.log("Invalid mode selected");
    }
    rl.close();
}

main();
