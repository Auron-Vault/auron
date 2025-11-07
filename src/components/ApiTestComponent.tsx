import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import apiService from '../services/apiService';
import { fonts } from '../constants/fonts';

const ApiTestComponent: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results: string[] = [];

    try {
      // Test 1: Health Check
      results.push('🔍 Testing health check...');
      const health = await apiService.healthCheck();
      results.push(`✅ Health check passed: ${health.status}`);

      // Test 2: Create Wallet
      results.push('🔍 Testing wallet creation...');
      const testAddress = `Test${Date.now()}`;
      const walletResult = await apiService.createOrGetWallet(
        testAddress,
        'main',
      );
      results.push(
        `✅ Wallet ${walletResult.created ? 'created' : 'retrieved'}: ${
          walletResult.wallet.id
        }`,
      );

      // Test 3: Get Wallet
      results.push('🔍 Testing wallet retrieval...');
      const getResult = await apiService.getWalletByAddress(testAddress);
      results.push(`✅ Wallet retrieved: ${getResult.wallet.public_address}`);

      // Test 4: Create Transaction
      results.push('🔍 Testing transaction creation...');
      const txResult = await apiService.createTransaction({
        walletId: walletResult.wallet.id,
        txHash: `test_tx_${Date.now()}`,
        txType: 'send',
        asset: 'SOL',
        amount: 1.5,
        toAddress: 'recipient_address',
        fromAddress: testAddress,
        status: 'pending',
      });
      results.push(`✅ Transaction created: ${txResult.transaction.id}`);

      // Test 5: Get Transactions
      results.push('🔍 Testing transaction retrieval...');
      const txsResult = await apiService.getTransactionsByWalletId(
        walletResult.wallet.id,
      );
      results.push(`✅ Retrieved ${txsResult.count} transactions`);

      setStatus('✅ All tests passed!');
    } catch (error: any) {
      results.push(`❌ Test failed: ${error.message}`);
      setStatus('❌ Tests failed');
    } finally {
      setTestResults(results);
      setIsLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-black p-4`}>
      <Text
        style={[
          tw`text-white text-2xl mb-4`,
          { fontFamily: fonts.pnbBold.fontFamily },
        ]}
      >
        API Integration Test
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <Text
            style={[
              tw`text-white text-xl mb-4`,
              { fontFamily: fonts.pnbSemiBold.fontFamily },
            ]}
          >
            {status}
          </Text>

          {testResults.map((result, index) => (
            <Text
              key={index}
              style={[
                tw`text-white text-sm mb-2`,
                { fontFamily: fonts.pnbRegular.fontFamily },
              ]}
            >
              {result}
            </Text>
          ))}

          <TouchableOpacity
            style={tw`mt-4 bg-blue-500 py-3 px-6 rounded-lg`}
            onPress={runTests}
          >
            <Text
              style={[
                tw`text-white text-center`,
                { fontFamily: fonts.pnbSemiBold.fontFamily },
              ]}
            >
              Run Tests Again
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ApiTestComponent;
