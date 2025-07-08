import { MetricServiceClient } from '@google-cloud/monitoring';
const client = new MetricServiceClient();
export async function recordMetric(type, value) {
    try {
        const projectId = await client.getProjectId();
        const request = {
            name: client.projectPath(projectId),
            timeSeries: [
                {
                    metric: { type },
                    resource: { type: 'global', labels: { project_id: projectId } },
                    points: [
                        {
                            interval: { endTime: { seconds: Date.now() / 1000 } },
                            value: { doubleValue: value },
                        },
                    ],
                },
            ],
        };
        await client.createTimeSeries(request);
    }
    catch (err) {
        console.error('recordMetric error', err);
    }
}
//# sourceMappingURL=metrics.js.map