import readline from "readline";
import {UpsertEmbeddings, getLLMResponse, queryEmbeddings} from "./services/embeddings.js";
import DUMMY_EMPLOYEES from "./data/data.js";
let isInitial = true;

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

async function addEmployee() {
    const id = await askQuestion("Enter the employee id: ");
    const name = await askQuestion("Enter the employee name: ");
    const email = await askQuestion("Enter the employee email: ");
    const role = await askQuestion("Enter the employee role: ");
    const department = await askQuestion("Enter the employee department: ");
    const skills = await askQuestion("Enter the employee skills (comma separated): ");

    const employeeText = `
        Name: ${name}
        Email: ${email}
        Role: ${role}
        Department: ${department}
        Skills: ${skills.split(',').map(skill=>`- ${skill}`).join('\n')}
    `;

    const employeeData = {
        name,
        email,
        role,
        department,
        skills
    };

    const response = await UpsertEmbeddings(employeeText, employeeData);
    console.log('Employee added successfully:', response);
}

async function searchEmployees() {
    console.log('\nConversation Mode (type "menu" to return to main menu, "quit" to exit)');
    console.log('----------------------------------------');
    
    let conversationHistory = [];
    
    while (true) {
        const question = await askQuestion("\nYour question: ");
        
        if (question.toLowerCase() === 'menu') {
            console.log('Returning to main menu...');
            return;
        }
        if (question.toLowerCase() === 'quit') {
            console.log('Thank you for using the Employee RAG system. Goodbye!');
            rl.close();
            process.exit(0);
        }

        const employeeData = await queryEmbeddings(question);
        const response = await getLLMResponse(employeeData, question, conversationHistory);
        console.log('\nAssistant:', response);
        
        // Add the current exchange to conversation history
        conversationHistory.push(
            { role: "user", content: question },
            { role: "assistant", content: response }
        );
        
        const followUp = await askQuestion('\nWould you like to ask another question? (yes/no/menu/quit): ');
        if (followUp.toLowerCase() === 'no' || followUp.toLowerCase() === 'menu') {
            console.log('Returning to main menu...');
            return;
        }
        if (followUp.toLowerCase() === 'quit') {
            console.log('Thank you for using the Employee RAG system. Goodbye!');
            rl.close();
            process.exit(0);
        }
        if (followUp.toLowerCase() === 'yes') {
            continue;
        }
    }
}

async function main() {
    console.log("Welcome to the Employee RAG system");
    console.log('--------------------------------');

    if (isInitial) {
        console.log("Initializing system with sample employees...");
        const response = await UpsertEmbeddings(DUMMY_EMPLOYEES, null, true);
        console.log('Initial employees added successfully');
        isInitial = false;
    }

    while (true) {
        console.log('\nWhat would you like to do?');
        console.log('1. Add a new employee');
        console.log('2. Search/Ask questions');
        console.log('3. Quit');
        
        const choice = await askQuestion('Enter your choice (1-3): ');

        switch (choice) {
            case '1':
                await addEmployee();
                break;
            case '2':
                await searchEmployees();
                break;
            case '3':
                console.log('Thank you for using the Employee RAG system. Goodbye!');
                rl.close();
                return;
            default:
                console.log('Invalid choice. Please try again.');
        }
    }
}

main().catch(error => {
    console.error('An error occurred:', error);
    rl.close();
});
