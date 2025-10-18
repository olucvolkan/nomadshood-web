import { getAllColivingSpaces } from '@/services/colivingService';
import { getAllCountriesFromDB } from '@/services/colivingService';

export default async function TestSupabasePage() {
  let colivings = [];
  let countries = [];
  let error = null;

  try {
    colivings = await getAllColivingSpaces();
    countries = await getAllCountriesFromDB();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Countries</h2>
          {countries.length === 0 ? (
            <p className="text-gray-500">No countries found. Please run INSERT_TEST_DATA.sql</p>
          ) : (
            <ul className="space-y-2">
              {countries.map(country => (
                <li key={country.id} className="flex items-center gap-2">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                  <span className="text-gray-500">({country.code})</span>
                  <span className="text-sm text-gray-400">
                    - {country.coliving_count || 0} colivings
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Spain Colivings</h2>
          {colivings.length === 0 ? (
            <div>
              <p className="text-gray-500 mb-2">No colivings found.</p>
              <p className="text-sm text-gray-400">
                Please run INSERT_TEST_DATA.sql in your Supabase SQL Editor to add test data.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">✅ Found {colivings.length} colivings!</p>
              <ul className="space-y-3">
                {colivings.map(coliving => (
                  <li key={coliving.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="font-semibold">{coliving.name}</div>
                    <div className="text-sm text-gray-600">{coliving.city}, {coliving.country}</div>
                    <div className="text-sm text-gray-500">
                      {coliving.monthlyPrice} {coliving.currency || 'EUR'}/month
                      {coliving.rating && <span className="ml-2">⭐ {coliving.rating}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>If no data appears, run <code className="bg-gray-100 px-2 py-1 rounded">INSERT_TEST_DATA.sql</code> in Supabase SQL Editor</li>
            <li>Verify Spain-only filtering is working (should only see Spanish colivings)</li>
            <li>Check that the connection to Supabase is successful</li>
            <li>Once data appears, test the main pages at <a href="/" className="text-blue-600 underline">/</a> and <a href="/coliving" className="text-blue-600 underline">/coliving</a></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
