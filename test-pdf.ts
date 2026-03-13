export async function testPdf() {
  const pdf = await import('npm:pdf-parse');
  console.log("pdf-parse imported");
}
testPdf();
