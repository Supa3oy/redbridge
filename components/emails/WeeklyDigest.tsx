import React from "react";

interface WeeklyDigestProps {
  userName: string;
  brandName: string;
  industry: string;
  trends: Array<{ title: string; description: string }>;
  postIdeas: Array<{ title: string; angle: string }>;
  usageCount: number;
  usageLimit: number | null;
  daysUntilReset: number;
  tipOfWeek: string;
  appUrl: string;
  unsubscribeUrl: string;
}

const c = {
  bg: "#0d0d0d",
  card: "#161616",
  border: "#222222",
  red: "#ff2d55",
  white: "#ffffff",
  muted: "#999999",
  faint: "#444444",
};

const base: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  backgroundColor: c.bg,
  margin: 0,
  padding: 0,
  WebkitTextSizeAdjust: "100%",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <tr>
      <td style={{ padding: "0 0 28px 0" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderRadius: "12px", backgroundColor: c.card, overflow: "hidden" }}>
          <tr>
            <td style={{ padding: "16px 20px", borderBottom: `1px solid ${c.border}` }}>
              <span style={{ fontFamily: "monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: c.red }}>
                {title}
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "20px" }}>
              {children}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  );
}

export function WeeklyDigest({
  userName,
  industry,
  trends,
  postIdeas,
  usageCount,
  usageLimit,
  daysUntilReset,
  tipOfWeek,
  appUrl,
  unsubscribeUrl,
}: WeeklyDigestProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your RedBridge Weekly</title>
      </head>
      <body style={base}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: c.bg, minHeight: "100vh" }}>
          <tr>
            <td align="center" style={{ padding: "40px 20px" }}>
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: "600px" }}>

                {/* Header */}
                <tr>
                  <td style={{ paddingBottom: "32px" }}>
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td>
                          <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "bold", letterSpacing: "0.2em", textTransform: "uppercase", color: c.red }}>
                            RedBridge
                          </span>
                        </td>
                        <td align="right">
                          <span style={{ fontFamily: "monospace", fontSize: "10px", color: c.faint }}>
                            Weekly Briefing
                          </span>
                        </td>
                      </tr>
                    </table>
                    <div style={{ height: "1px", backgroundColor: c.border, marginTop: "12px" }} />
                  </td>
                </tr>

                {/* Greeting */}
                <tr>
                  <td style={{ paddingBottom: "32px" }}>
                    <h1 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "bold", color: c.white, lineHeight: "1.3" }}>
                      Good morning, {userName} 👋
                    </h1>
                    <p style={{ margin: 0, fontSize: "14px", color: c.muted, lineHeight: "1.6" }}>
                      Here&apos;s your RedBridge weekly XHS briefing for {industry !== "General" ? `the ${industry} space` : "this week"}.
                    </p>
                  </td>
                </tr>

                {/* Trends section */}
                <Section title="This Week's Top XHS Trends">
                  {trends.length > 0 ? (
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      {trends.map((trend, i) => (
                        <tr key={i}>
                          <td style={{ paddingBottom: i < trends.length - 1 ? "16px" : 0 }}>
                            <table width="100%" cellPadding={0} cellSpacing={0}>
                              <tr>
                                <td style={{ width: "24px", verticalAlign: "top", paddingTop: "2px" }}>
                                  <span style={{ fontFamily: "monospace", fontSize: "12px", color: c.red, fontWeight: "bold" }}>
                                    {i + 1}.
                                  </span>
                                </td>
                                <td>
                                  <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: c.white }}>
                                    {trend.title}
                                  </p>
                                  <p style={{ margin: 0, fontSize: "13px", color: c.muted, lineHeight: "1.5" }}>
                                    {trend.description}
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      ))}
                    </table>
                  ) : (
                    <p style={{ margin: 0, fontSize: "13px", color: c.muted }}>
                      Open RedBridge to generate fresh trends for your industry.
                    </p>
                  )}
                </Section>

                {/* Post ideas */}
                <Section title="3 Recommended Posts for This Week">
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    {postIdeas.map((idea, i) => (
                      <tr key={i}>
                        <td style={{ paddingBottom: i < postIdeas.length - 1 ? "16px" : 0 }}>
                          <div style={{ backgroundColor: c.bg, borderRadius: "8px", padding: "14px 16px", borderLeft: `3px solid ${c.red}` }}>
                            <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: c.white }}>
                              {idea.title}
                            </p>
                            <p style={{ margin: 0, fontSize: "13px", color: c.muted, lineHeight: "1.5" }}>
                              {idea.angle}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </table>
                </Section>

                {/* Usage summary */}
                <Section title="Your Usage This Month">
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td>
                        <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: c.white }}>
                          You&apos;ve used{" "}
                          <span style={{ color: c.red, fontWeight: "bold" }}>{usageCount}</span>
                          {" "}of{" "}
                          <span style={{ fontWeight: "bold", color: c.white }}>
                            {usageLimit === null ? "unlimited" : usageLimit}
                          </span>
                          {" "}generations this month.
                        </p>
                        {usageLimit !== null && (
                          <div style={{ height: "6px", backgroundColor: c.border, borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.min((usageCount / usageLimit) * 100, 100)}%`,
                                backgroundColor: usageCount / usageLimit >= 0.9 ? "#ef4444" : usageCount / usageLimit >= 0.6 ? "#f59e0b" : "#10b981",
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                        )}
                        <p style={{ margin: 0, fontSize: "13px", color: c.muted }}>
                          Resets in {daysUntilReset} day{daysUntilReset !== 1 ? "s" : ""}.
                        </p>
                      </td>
                    </tr>
                  </table>
                </Section>

                {/* Tip of the week */}
                <Section title="Tip of the Week">
                  <div style={{ borderLeft: `3px solid ${c.red}`, paddingLeft: "16px" }}>
                    <p style={{ margin: 0, fontSize: "14px", color: c.white, lineHeight: "1.7", fontStyle: "italic" }}>
                      &ldquo;{tipOfWeek}&rdquo;
                    </p>
                  </div>
                </Section>

                {/* CTA */}
                <tr>
                  <td style={{ paddingBottom: "40px", textAlign: "center" }}>
                    <a
                      href={appUrl}
                      style={{
                        display: "inline-block",
                        backgroundColor: c.red,
                        color: c.white,
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                        padding: "14px 32px",
                        borderRadius: "8px",
                        letterSpacing: "0.01em",
                      }}
                    >
                      Open RedBridge →
                    </a>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ paddingTop: "24px", borderTop: `1px solid ${c.border}`, textAlign: "center" }}>
                    <p style={{ margin: "0 0 8px 0", fontFamily: "monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: c.faint }}>
                      RedBridge — XHS toolkit for Australian brands
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: c.faint }}>
                      <a href={unsubscribeUrl} style={{ color: c.faint, textDecoration: "underline" }}>
                        Unsubscribe from weekly emails
                      </a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
