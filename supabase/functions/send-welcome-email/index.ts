import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  verificationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, verificationUrl }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Drilzz <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Drilzz! Please verify your email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header { 
                background: linear-gradient(135deg, #E90044 0%, #3635B5 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
              }
              .header h1 {
                margin: 0;
                font-size: 32px;
                font-weight: 700;
              }
              .header p {
                margin: 10px 0 0 0;
                opacity: 0.95;
                font-size: 16px;
              }
              .content { 
                padding: 40px 30px; 
              }
              .welcome-message {
                font-size: 18px;
                margin-bottom: 20px;
                color: #1a202c;
              }
              .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #E90044 0%, #3635B5 100%); 
                color: white; 
                padding: 16px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: 600; 
                margin: 30px 0;
                box-shadow: 0 4px 12px rgba(233, 0, 68, 0.3);
                transition: transform 0.2s;
              }
              .button:hover {
                transform: translateY(-2px);
              }
              .features {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 24px;
                margin: 30px 0;
              }
              .feature {
                display: flex;
                align-items: start;
                margin: 16px 0;
              }
              .feature-icon {
                background: linear-gradient(135deg, #E90044 0%, #3635B5 100%);
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 16px;
                font-weight: bold;
                flex-shrink: 0;
              }
              .feature-text {
                flex: 1;
              }
              .feature-title {
                font-weight: 600;
                color: #1a202c;
                margin: 0 0 4px 0;
              }
              .feature-desc {
                color: #6b7280;
                margin: 0;
                font-size: 14px;
              }
              .footer { 
                text-align: center; 
                color: #6b7280; 
                font-size: 14px; 
                padding: 30px;
                background: #f8f9fa;
              }
              .footer a {
                color: #E90044;
                text-decoration: none;
              }
              .divider {
                height: 1px;
                background: #e5e7eb;
                margin: 30px 0;
              }
              .warning { 
                background: #fef3c7; 
                border-left: 4px solid #f59e0b; 
                padding: 16px; 
                margin: 20px 0; 
                border-radius: 4px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚡ Welcome to Drilzz!</h1>
                <p>Multi-Sport Coaching Platform</p>
              </div>
              
              <div class="content">
                <p class="welcome-message">Hi <strong>${name}</strong>,</p>
                
                <p>Welcome to Drilzz! We're thrilled to have you join our community of passionate coaches dedicated to excellence in sports training.</p>
                
                <p>Before you get started, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Or copy and paste this link into your browser:</p>
                <p style="background: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px; color: #6b7280;">${verificationUrl}</p>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> This verification link will expire in 24 hours.
                </div>
                
                <div class="divider"></div>
                
                <div class="features">
                  <h3 style="margin: 0 0 20px 0; color: #1a202c;">What you can do with Drilzz:</h3>
                  
                  <div class="feature">
                    <div class="feature-icon">📚</div>
                    <div class="feature-text">
                      <p class="feature-title">Create & Share Drills</p>
                      <p class="feature-desc">Design professional training drills with images, videos, and detailed coaching points</p>
                    </div>
                  </div>
                  
                  <div class="feature">
                    <div class="feature-icon">🤝</div>
                    <div class="feature-text">
                      <p class="feature-title">Connect with Coaches</p>
                      <p class="feature-desc">Follow other coaches, discover new training techniques, and build your network</p>
                    </div>
                  </div>
                  
                  <div class="feature">
                    <div class="feature-icon">⭐</div>
                    <div class="feature-text">
                      <p class="feature-title">Save & Organize</p>
                      <p class="feature-desc">Create collections of your favorite drills and keep everything organized</p>
                    </div>
                  </div>
                  
                  <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">
                      <p class="feature-title">Track Progress</p>
                      <p class="feature-desc">Rate drills, leave feedback, and see what's working best in your community</p>
                    </div>
                  </div>
                </div>
                
                <div class="divider"></div>
                
                <p style="color: #6b7280; font-size: 14px;">If you didn't create an account with Drilzz, you can safely ignore this email.</p>
              </div>
              
              <div class="footer">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #1a202c;">Drilzz</p>
                <p style="margin: 0;">Create, share & discover coaching drills</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
