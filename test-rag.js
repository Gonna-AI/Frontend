import { pipeline } from '@xenova/transformers';

async function testEmbedding() {
    console.log('Loading model...');
    const generator = await pipeline('feature-extraction', 'Supabase/gte-small', {
        quantized: true,
    });
    console.log('Model loaded. Generating embedding...');
    const output = await generator('This is a test document.', {
        pooling: 'mean',
        normalize: true,
    });

    const embedding = Array.from(output.data);
    console.log(`Embedding generated successfully! Dimension: ${embedding.length}`);
    console.log('First 5 elements:', embedding.slice(0, 5));
}

testEmbedding().catch(console.error);
