import { MOCK_PREDICTIONS } from '../utils/constants';

export interface Prediction {
  disease_id: string | null;
  name: string;
  confidence: number;
}

export interface PredictionResponse {
  predictions: Prediction[];
}

export async function getPredictionFromApi(imageUrl: string): Promise<PredictionResponse> {
  try {
    const response = await fetch(process.env.EXPO_PUBLIC_PREDICTION_API_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    if (!response.ok) {
      throw new Error('Prediction API failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Using mock predictions due to API error:', error);
    return { predictions: MOCK_PREDICTIONS };
  }
}

export async function getMockPrediction(): Promise<PredictionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { predictions: MOCK_PREDICTIONS };
}
