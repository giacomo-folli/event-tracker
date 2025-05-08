import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ApiDocs() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">API Documentation</CardTitle>
      </CardHeader>
      <CardContent className="prose max-w-none">
        <Tabs defaultValue="events">
          <TabsList className="mb-4 w-full md:w-auto">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
          </TabsList>
          
          {/* EVENTS ENDPOINTS */}
          <TabsContent value="events">
            <h3>Events API Endpoints</h3>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Get All Events</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/events</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Returns a list of all events.</p>
              
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
      "description": "Annual company conference with keynote speakers and workshops.",
      "creatorId": 1
    },
    {
      "id": 2,
      "title": "Product Launch",
      "startDate": "2023-12-01T14:00:00Z",
      "endDate": "2023-12-01T16:30:00Z",
      "location": "Downtown Venue",
      "description": "Launching our new product line with demonstrations and special guests.",
      "creatorId": 1
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
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Create Event</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">POST</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/events</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Creates a new event.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "title": "New Event Title",
  "description": "Event description",
  "location": "Event location",
  "startDate": "2025-05-25T10:00:00.000Z",
  "endDate": "2025-05-25T15:00:00.000Z"
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Update Event</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PUT</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/events/{"{id}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Updates an existing event.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "title": "Updated Event Title",
  "description": "Updated description",
  "location": "Updated location",
  "startDate": "2025-05-25T10:00:00.000Z",
  "endDate": "2025-05-25T15:00:00.000Z"
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Delete Event</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">DELETE</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/events/{"{id}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Deletes an event.</p>
            </div>
          </TabsContent>
          
          {/* COURSES ENDPOINTS */}
          <TabsContent value="courses">
            <h3>Courses API Endpoints</h3>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Get All Courses</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/courses</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Returns a list of all courses.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Get Course</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/courses/{"{id}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Returns details for a specific course.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Create Course</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">POST</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/courses</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Creates a new course.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "title": "Course Title",
  "description": "Course description",
  "instructor": "Instructor Name",
  "level": "beginner", // beginner, intermediate, or advanced
  "duration": "8 weeks",
  "startDate": "2025-06-01T00:00:00.000Z"
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Update Course</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PUT</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/courses/{"{id}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Updates an existing course.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Delete Course</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">DELETE</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/courses/{"{id}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Deletes a course.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Get Course Media</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/courses/{"{courseId}"}/media</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Returns all media linked to a course.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Link Media to Course</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">POST</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/courses/{"{courseId}"}/media/{"{mediaId}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Links a media item to a course.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "order": 0 // Optional - display order of the media in the course
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Unlink Media from Course</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">DELETE</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/courses/{"{courseId}"}/media/{"{mediaId}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Removes a media item from a course.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Update Media Order</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PUT</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/courses/{"{courseId}"}/media/{"{mediaId}"}/order</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Updates the display order of a media item within a course.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "order": 2 // New display order
}`}
                </pre>
              </div>
            </div>
          </TabsContent>
          
          {/* MEDIA ENDPOINTS */}
          <TabsContent value="media">
            <h3>Media API Endpoints</h3>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Get All Media</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/media</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Returns a list of all media items.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Get Media Item</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/media/{"{id}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Returns details for a specific media item.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Upload Media</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">POST</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/media</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Uploads a new media file.</p>
              <p className="mt-1 text-xs text-gray-500">Note: This endpoint uses multipart/form-data encoding.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Form Fields:</h5>
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
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">file</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">file</td>
                      <td className="px-3 py-2 text-xs text-gray-700">The media file to upload</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">title</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">string</td>
                      <td className="px-3 py-2 text-xs text-gray-700">Title for the media</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">description</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">string</td>
                      <td className="px-3 py-2 text-xs text-gray-700">Optional description</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">mediaType</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">string</td>
                      <td className="px-3 py-2 text-xs text-gray-700">Type of media: 'image', 'video', 'document', or 'audio'</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Update Media</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PUT</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/media/{"{id}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Updates media metadata.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "title": "Updated Title",
  "description": "Updated description"
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Delete Media</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">DELETE</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/media/{"{id}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Deletes a media item and its file.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Access Media File</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                <code className="ml-2 text-sm text-gray-800">/uploads/{"{filename}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Directly access a media file by its filename.</p>
            </div>
          </TabsContent>
          
          {/* USER ENDPOINTS */}
          <TabsContent value="user">
            <h3>User API Endpoints</h3>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Get Current User</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/user</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Returns information about the current user.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Update User Settings</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PUT</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/user/settings</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Updates user settings.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "emailNotifications": true,
  "browserNotifications": false,
  "apiChangeNotifications": true
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Update Password</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PUT</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/user/password</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Updates user password.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "currentPassword": "old-password",
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Initialize Admin User</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">POST</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/init-admin</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Creates an admin user if none exists.</p>
              <p className="mt-1 text-xs text-gray-500 italic">Note: This endpoint is primarily used for system initialization.</p>
            </div>
          </TabsContent>
          
          {/* AUTHENTICATION ENDPOINTS */}
          <TabsContent value="authentication">
            <h3>Authentication</h3>
            <p className="mb-4">The API supports two authentication methods:</p>
            
            <h4 className="text-md font-semibold">1. Session-based Authentication</h4>
            <p className="mb-4">This is used when accessing the API through the web interface. Use the login endpoint to authenticate and receive a session cookie.</p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Log In</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">POST</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/login</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Authenticates a user and creates a session.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "username": "your-username",
  "password": "your-password"
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Log Out</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">POST</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/logout</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Ends the current session.</p>
            </div>
            
            <h4 className="text-md font-semibold mt-8">2. API Key Authentication</h4>
            <p className="mb-4">For programmatic access to the API, use API keys. These keys can be created and managed in the user settings panel.</p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">API Key Usage</h4>
              <p className="mt-2 text-sm text-gray-600">To use an API key, include it in the <code>X-API-Key</code> header with all requests:</p>
              
              <pre className="mt-4 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`// Example HTTP request with API key
GET /api/events HTTP/1.1
Host: example.com
X-API-Key: your-api-key-here`}
              </pre>
            </div>
            
            <h4 className="text-md font-semibold mt-6">API Key Management Endpoints</h4>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Get API Keys</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GET</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/keys</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Returns a list of all API keys for the authenticated user.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Create API Key</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">POST</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/keys</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Creates a new API key.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "name": "My API Key",
  "expiryDays": 30 // Optional - number of days until key expires
}`}
                </pre>
              </div>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Response:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "apiKey": {
    "id": 1,
    "name": "My API Key",
    "key": "ak_1234567890abcdef1234567890abcdef",
    "createdAt": "2025-05-01T12:00:00Z",
    "isActive": true,
    "expiresAt": "2025-06-01T12:00:00Z"
  },
  "message": "API key created successfully. Save this key as it will not be shown again."
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Toggle API Key Status</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PUT</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/keys/{"{id}"}/toggle</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Activates or deactivates an API key.</p>
              
              <div className="mt-4">
                <h5 className="text-xs font-semibold text-gray-700">Request Body:</h5>
                <pre className="mt-2 bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "isActive": true // or false to deactivate
}`}
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Delete API Key</h4>
              <div className="mt-2 flex items-center">
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">DELETE</Badge>
                <code className="ml-2 text-sm text-gray-800">/api/keys/{"{id}"}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">Permanently deletes an API key.</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <h3 className="mt-8">Error Handling</h3>
        <p>The API returns standard HTTP status codes. Error responses include a message field with details about the error.</p>
        <pre className="bg-gray-800 text-green-300 p-4 rounded-md overflow-x-auto text-xs">
{`{
  "error": "Error message or details"
}`}
        </pre>
        
        <h3 className="mt-6">Common Status Codes</h3>
        <table className="min-w-full divide-y divide-gray-200 mt-2">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status Code</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">200 OK</td>
              <td className="px-3 py-2 text-xs text-gray-700">The request was successful.</td>
            </tr>
            <tr>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">201 Created</td>
              <td className="px-3 py-2 text-xs text-gray-700">The resource was successfully created.</td>
            </tr>
            <tr>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">400 Bad Request</td>
              <td className="px-3 py-2 text-xs text-gray-700">The request was invalid or malformed.</td>
            </tr>
            <tr>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">404 Not Found</td>
              <td className="px-3 py-2 text-xs text-gray-700">The requested resource was not found.</td>
            </tr>
            <tr>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">500 Internal Server Error</td>
              <td className="px-3 py-2 text-xs text-gray-700">An error occurred on the server.</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
