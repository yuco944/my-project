function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

// テストケース
console.log('PT30S =', parseDuration('PT30S'), 'seconds (expected: 30)');
console.log('PT1M =', parseDuration('PT1M'), 'seconds (expected: 60)');
console.log('PT1M30S =', parseDuration('PT1M30S'), 'seconds (expected: 90)');
console.log('PT10M45S =', parseDuration('PT10M45S'), 'seconds (expected: 645)');
console.log('PT1H =', parseDuration('PT1H'), 'seconds (expected: 3600)');
console.log('PT1H30M =', parseDuration('PT1H30M'), 'seconds (expected: 5400)');

// Shorts判定テスト
console.log('\nShorts判定 (60秒以下):');
console.log('PT30S:', parseDuration('PT30S') <= 60);
console.log('PT59S:', parseDuration('PT59S') <= 60);
console.log('PT1M:', parseDuration('PT1M') <= 60);
console.log('PT1M1S:', parseDuration('PT1M1S') <= 60);
