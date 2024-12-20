import AWS from 'aws-sdk';
import { S3Handler, S3Event, Context, Callback } from 'aws-lambda';
import axios from 'axios';

const s3 = new AWS.S3();

export const handler: S3Handler = async (event: S3Event, context: Context, callback: Callback) => {
  console.log('Evento S3 recebido:', JSON.stringify(event));

  if (!event.Records || event.Records.length === 0) {
    console.error('Nenhum evento S3 recebido.');
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ error: 'Nenhum evento S3 recebido.' }),
    });
  }

  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;
  console.log(`Notificando audioprocessor sobre o arquivo: ${objectKey} do bucket: ${bucketName}`);

  try {
    // Fazer requisição para o serviço de transcrição
    const response = await axios.post(`${process.env.AUDIO_PROCESSOR_URL}/transcribeAudio`, {
      videoId: objectKey
    });

    console.log('Resposta do audioprocessor:', response.data);

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ message: `Notificação enviada para audioprocessor sobre o arquivo: ${objectKey}` }),
    });
  } catch (error) {
    console.error('Erro ao notificar audioprocessor:', error);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao notificar audioprocessor.' }),
    });
  }
};
