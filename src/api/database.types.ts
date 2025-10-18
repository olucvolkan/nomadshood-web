// Supabase Database Types
// This file defines the TypeScript types for the Supabase PostgreSQL database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      colivings: {
        Row: {
          id: string
          name: string
          address: string
          logo_url: string | null
          main_image_url: string | null
          video_url: string | null
          whatsapp_link: string | null
          website_url: string | null
          tags: string[] | null
          data_ai_hint: string | null
          country: string
          country_code: string
          city: string
          region: string | null
          coordinates: Json | null
          average_budget: string | null
          budget_range: Json | null
          gallery: string[] | null
          coworking_access: string | null
          amenities: string[] | null
          room_types: Json[] | null
          vibe: string | null
          contact: Json | null
          capacity: number | null
          minimum_stay: string | null
          check_in: string | null
          languages: string[] | null
          age_range: string | null
          rating: number | null
          reviews_count: number | null
          wifi_speed: string | null
          climate: string | null
          timezone: string | null
          nearby_attractions: string[] | null
          transportation: Json | null
          created_at: string | null
          updated_at: string | null
          status: string | null
          brand: string | null
          monthly_price: number
          has_private_bathroom: boolean | null
          has_coworking: boolean | null
          email: string | null
          phone: string | null
          currency: string | null
          min_price: number | null
          cover_image: string | null
          logo: string | null
          youtube_video_link: string | null
          flag_url: string | null
          flag_code: string | null
        }
        Insert: Omit<Database['public']['Tables']['colivings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['colivings']['Insert']>
      }
      coliving_nearby_places: {
        Row: {
          id: string
          coliving_id: string
          coliving_name: string | null
          coliving_city: string | null
          coliving_country: string | null
          coliving_website: string | null
          coliving_location: Json | null
          nearby_places: Json | null
          summary: Json | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['coliving_nearby_places']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['coliving_nearby_places']['Insert']>
      }
      coliving_reviews: {
        Row: {
          id: string
          coliving_id: string
          coliving_name: string | null
          coliving_city: string | null
          coliving_country: string | null
          coliving_website: string | null
          google_place_id: string | null
          google_name: string | null
          google_address: string | null
          google_rating: number | null
          google_total_ratings: number | null
          google_website: string | null
          google_phone: string | null
          total_reviews: number | null
          recent_reviews_count: number | null
          average_sentiment: number | null
          reviews: Json[]
          crawled_at: string | null
          api_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['coliving_reviews']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['coliving_reviews']['Insert']>
      }
      countries: {
        Row: {
          id: string
          code: string
          name: string
          cover_image: string | null
          flag: string | null
          flag_image_url: string | null
          continent: string | null
          currency: string | null
          timezone: string | null
          popular_cities: string[] | null
          coliving_count: number | null
          source: string | null
          community_count: number | null
          community_members: number | null
          community_cities: string[] | null
          community_platforms: string[] | null
          communities: Json[]
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['countries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['countries']['Insert']>
      }
      mail_subscriber: {
        Row: {
          id: string
          email: string
          countries: string[]
          language: string | null
          created_at: string | null
          payment_status: string | null
          payment_id: string | null
          active: boolean
        }
        Insert: Omit<Database['public']['Tables']['mail_subscriber']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['mail_subscriber']['Insert']>
      }
      nomad_videos: {
        Row: {
          id: string
          title: string
          thumbnail_url: string
          youtube_url: string
          view_count: number
          like_count: number
          comment_count: number
          duration: number
          published_at: string
          destination: string | null
          data_ai_hint: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['nomad_videos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['nomad_videos']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
