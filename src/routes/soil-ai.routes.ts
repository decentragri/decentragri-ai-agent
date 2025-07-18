//** ELYSIA IMPORT
import Elysia from 'elysia';

//** SERVICE IMPORTS */
import SoilSensorRunner from '../ai.services/soil.ai.team.service/soil.main';
import { sensorSessionSchema } from '../ai.services/soil.ai.team.service/soil.schema';
import SoilAnalysis from '../soilanalysis.services/soilanalysisdata';
import { authBearerSchema } from '../auth.services/auth.schema';
import type { SensorReadingsWithInterpretation } from '../ai.services/soil.ai.team.service/soil.types';
import { getSoilAnalysisByFarmSchema } from '../soilanalysis.services/soilanalysis.schema';

const SoilAi = (app: Elysia) => {
    app.post('api/save-sensor-readings', async ({ headers, body }) => {
        try {
            const authorizationHeader: string = headers.authorization;
            if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
                throw new Error('Bearer token not found in Authorization header');
            }
            const jwtToken: string = authorizationHeader.substring(7);
            const output = await SoilSensorRunner.analyzeFromApi(jwtToken, body);
    
            return output;
        } catch (error: any) {
            console.error(error);
            throw error;
        }
    }, sensorSessionSchema
    )

    .get('api/get-soil-analysis-data', async ({ headers }): Promise<SensorReadingsWithInterpretation[]> => {
        try {
            const authorizationHeader: string = headers.authorization;
            if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
                throw new Error('Bearer token not found in Authorization header');
            }
            const jwtToken: string = authorizationHeader.substring(7);
            const soilAnalysis = new SoilAnalysis();
            const output = await soilAnalysis.getSoilAnalysisData(jwtToken);
    
            return output;
        } catch (error: any) {
            console.error(error);
            throw error;
        }
    }, authBearerSchema
    )

    .get('api/get-soil-analysis-by-farm/:farmName', async ({ headers, params }): Promise<SensorReadingsWithInterpretation[]> => {
        try {
            const authorizationHeader: string = headers.authorization;
            if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
                throw new Error('Bearer token not found in Authorization header');
            }
            const jwtToken: string = authorizationHeader.substring(7);
            const soilAnalysis = new SoilAnalysis();
            const output = await soilAnalysis.getSoilAnalysisDataByFarm(jwtToken, params.farmName);
    
            return output;
        } catch (error: any) {
            console.error(error);
            throw error;
        }
    }, getSoilAnalysisByFarmSchema
    )

    
}

export default SoilAi;