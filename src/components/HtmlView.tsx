import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../theme/useTheme';

export function HtmlView({ html }: { html: string }) {
  const t = useTheme();

  const document = useMemo(
    () => `<!doctype html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    :root { color-scheme: ${t.background.startsWith('#0') ? 'dark' : 'light'}; }
    html, body {
      margin: 0; padding: 14px 16px;
      background: ${t.background};
      color: ${t.text};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 15px; line-height: 1.45;
      -webkit-text-size-adjust: 100%;
    }
    h2 { font-size: 17px; margin: 16px 0 6px; color: ${t.accent}; }
    h3 { font-size: 15px; margin: 14px 0 4px; color: ${t.text}; }
    h4 { font-size: 14px; margin: 10px 0 4px; color: ${t.text}; opacity: 0.9; }
    ul { margin: 4px 0 4px 18px; padding: 0; }
    li { margin: 2px 0; }
    p { margin: 6px 0; }
    small { color: ${t.textMuted}; }
    strong { color: ${t.text}; }
    hr { border: 0; border-top: 1px solid ${t.border}; margin: 12px 0; }
  </style>
</head>
<body>${html}</body>
</html>`,
    [html, t]
  );

  return (
    <View style={styles.wrap}>
      <WebView
        originWhitelist={['*']}
        source={{ html: document }}
        style={{ backgroundColor: t.background }}
        scalesPageToFit={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
});
