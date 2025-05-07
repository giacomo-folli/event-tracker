import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ApiDocs() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">API Documentation</CardTitle>
      </CardHeader>
      <CardContent className="prose max-w-none">
        <h3>Public API Endpoints</h3>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-sm font-semibold text-gray-900">Get All Events</h4>
          <div className="mt-2 flex items-center">
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
            <code className="ml-2 text-sm text-gray-800">/api/events</code>
          </div>
          <p className="mt-2 text-sm text-gray-600">Returns a list of all public events.</p>
          
          <div className="mt-4">
            <h5 className="text-xs font-semibold text-gray-700">Example Response:</h5>
            <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "events": [
    {
      "id": 1,
      "title": "Company Conference",
      "startDate": "2023-11-15T09:00:00Z",
      "endDate": "2023-11-17T17:00:00Z",
      "location": "Grand Conference Center",
      "description": "Annual company conference with keynote speakers and workshops."
    },
    {
      "id": 2,
      "title": "Product Launch",
      "startDate": "2023-12-01T14:00:00Z",
      "endDate": "2023-12-01T16:30:00Z",
      "location": "Downtown Venue",
      "description": "Launching our new product line with demonstrations and special guests."
    }
  ]
}`}
            </pre>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-sm font-semibold text-gray-900">Get Single Event</h4>
          <div className="mt-2 flex items-center">
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
            <code className="ml-2 text-sm text-gray-800">/api/events/{"{id}"}</code>
          </div>
          <p className="mt-2 text-sm text-gray-600">Returns details for a specific event.</p>
          
          <div className="mt-4">
            <h5 className="text-xs font-semibold text-gray-700">Parameters:</h5>
            <table className="mt-2 min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">id</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">integer</td>
                  <td className="px-3 py-2 text-xs text-gray-700">Event ID</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <h3>Authentication</h3>
        <p>The API uses API keys for authentication. Include your API key in the request headers:</p>
        <pre className="bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
          X-API-Key: your_api_key_here
        </pre>
        
        <h3>Rate Limiting</h3>
        <p>The API is rate limited to 100 requests per minute per API key. If you exceed this limit, you'll receive a 429 Too Many Requests response.</p>
        
        <h3>Error Handling</h3>
        <p>The API returns standard HTTP status codes. Error responses include a message field with details about the error.</p>
        <pre className="bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "error": {
    "status": 404,
    "message": "Event not found"
  }
}`}
        </pre>
      </CardContent>
    </Card>
  );
}
