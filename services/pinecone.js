import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index("employee-demo-rag");

export default index;
export {pinecone,index};