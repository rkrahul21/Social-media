import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // createAdminClient uses the SERVICE_ROLE_KEY to bypass RLS
    const supabase = await createAdminClient(); 
    
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, first_name, avatar_url, bio');

        if (error) {
            console.error("Supabase DB Error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // If no profiles found, return an empty array instead of failing
        if (!profiles) return NextResponse.json([]);

        const profileCards = profiles.map((profile) => ({
            id: profile.id,
            name: profile.first_name || "Unknown",
            // Use the key 'avatar' to match your ProfileCardProps interface
            avatar: profile.avatar_url || "/default-avatar.png", 
            bio: profile.bio || "",
            isFollowing: false,
        }));

        console.log("Fetched Profiles:", profileCards);
        return NextResponse.json(profileCards); 
        
    } catch (error) {
        console.error("Server Crash:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
