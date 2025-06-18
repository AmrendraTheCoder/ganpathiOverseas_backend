#!/bin/bash

echo "🔍 Verifying Database Fix..."
echo "=============================="

# Test the database verification API
echo "📊 Running database verification..."
curl -s http://localhost:3000/api/db-verify | jq '
{
  overall_status: .results.overall_status,
  checks_passed: .results.summary.passed,
  total_checks: .results.summary.total_checks,
  success_rate: (.results.summary.passed / .results.summary.total_checks * 100 | round),
  failed_checks: [.results.checks[] | select(.status == "FAIL") | keys[]]
}'

echo ""
echo "🧪 Testing finance transactions API..."
curl -s "http://localhost:3000/api/finance/transactions?page=1&limit=5" | jq '
{
  success: .success,
  transaction_count: (.transactions | length),
  setup_required: .setup_required
}'

echo ""
echo "📈 Testing complete setup verification..."
curl -s http://localhost:3000/api/test-complete-setup | jq '
{
  overall_status: .results.overall_status,
  tests_passed: .results.summary.passed,
  total_tests: .results.summary.total_tests,
  demo_data_counts: .results.demo_data_counts
}'

echo ""
echo "🎉 Verification Complete!"
echo "========================="

# Check if everything is working
OVERALL_STATUS=$(curl -s http://localhost:3000/api/db-verify | jq -r '.results.overall_status')

if [ "$OVERALL_STATUS" = "ALL_SYSTEMS_GO" ]; then
    echo "✅ SUCCESS! All database issues resolved!"
    echo "✅ Finance dashboard should now show 'All Systems Go'"
    echo "✅ All finance features should be working"
else
    echo "❌ Issues remain. Status: $OVERALL_STATUS"
    echo "❌ Please check the SQL execution in Supabase Dashboard"
    echo "📝 Ensure all migration SQL was executed successfully"
fi 