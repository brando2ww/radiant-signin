export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bills: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          due_date: string
          id: string
          is_recurring: boolean | null
          paid_at: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          is_recurring?: boolean | null
          paid_at?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          is_recurring?: boolean | null
          paid_at?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          business_description: string | null
          business_name: string
          business_slogan: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          thank_you_message: string | null
          updated_at: string | null
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          business_description?: string | null
          business_name: string
          business_slogan?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          thank_you_message?: string | null
          updated_at?: string | null
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          business_description?: string | null
          business_name?: string
          business_slogan?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          thank_you_message?: string | null
          updated_at?: string | null
          user_id?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          brand: string | null
          closing_day: number | null
          color: string | null
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          due_day: number | null
          id: string
          is_active: boolean | null
          last_four_digits: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          closing_day?: number | null
          color?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          due_day?: number | null
          id?: string
          is_active?: boolean | null
          last_four_digits?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          closing_day?: number | null
          color?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          due_day?: number | null
          id?: string
          is_active?: boolean | null
          last_four_digits?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crm_activities: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean | null
          lead_id: string
          scheduled_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          lead_id: string
          scheduled_at?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          lead_id?: string
          scheduled_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          avatar_url: string | null
          closed_date: string | null
          company: string | null
          converted_to_transaction_id: string | null
          created_at: string
          email: string | null
          estimated_value: number | null
          expected_close_date: string | null
          first_contact_date: string | null
          id: string
          last_contact_date: string | null
          name: string
          phone: string | null
          position: string | null
          priority: string | null
          project_description: string | null
          project_title: string
          source: string | null
          stage: string
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          win_probability: number | null
        }
        Insert: {
          avatar_url?: string | null
          closed_date?: string | null
          company?: string | null
          converted_to_transaction_id?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          first_contact_date?: string | null
          id?: string
          last_contact_date?: string | null
          name: string
          phone?: string | null
          position?: string | null
          priority?: string | null
          project_description?: string | null
          project_title: string
          source?: string | null
          stage?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          win_probability?: number | null
        }
        Update: {
          avatar_url?: string | null
          closed_date?: string | null
          company?: string | null
          converted_to_transaction_id?: string | null
          created_at?: string
          email?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          first_contact_date?: string | null
          id?: string
          last_contact_date?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          priority?: string | null
          project_description?: string | null
          project_title?: string
          source?: string | null
          stage?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          win_probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_converted_to_transaction_id_fkey"
            columns: ["converted_to_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          lead_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          lead_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          lead_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_evaluations: {
        Row: {
          created_at: string
          customer_birth_date: string
          customer_name: string
          customer_whatsapp: string
          evaluation_date: string
          id: string
          nps_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_birth_date: string
          customer_name: string
          customer_whatsapp: string
          evaluation_date?: string
          id?: string
          nps_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          customer_birth_date?: string
          customer_name?: string
          customer_whatsapp?: string
          evaluation_date?: string
          id?: string
          nps_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      delivery_addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          customer_id: string
          id: string
          is_default: boolean | null
          label: string | null
          neighborhood: string
          number: string
          reference: string | null
          state: string
          street: string
          zip_code: string | null
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          neighborhood: string
          number: string
          reference?: string | null
          state: string
          street: string
          zip_code?: string | null
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          neighborhood?: string
          number?: string
          reference?: string | null
          state?: string
          street?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "delivery_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          order_position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          order_position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          order_position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      delivery_coupons: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_value: number | null
          type: string
          usage_count: number | null
          usage_limit: number | null
          user_id: string
          valid_from: string
          valid_until: string
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          type?: string
          usage_count?: number | null
          usage_limit?: number | null
          user_id: string
          valid_from?: string
          valid_until: string
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          type?: string
          usage_count?: number | null
          usage_limit?: number | null
          user_id?: string
          valid_from?: string
          valid_until?: string
          value?: number
        }
        Relationships: []
      }
      delivery_customers: {
        Row: {
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_order_item_options: {
        Row: {
          id: string
          item_name: string
          option_name: string
          order_item_id: string
          price_adjustment: number | null
        }
        Insert: {
          id?: string
          item_name: string
          option_name: string
          order_item_id: string
          price_adjustment?: number | null
        }
        Update: {
          id?: string
          item_name?: string
          option_name?: string
          order_item_id?: string
          price_adjustment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_order_item_options_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "delivery_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_order_items: {
        Row: {
          id: string
          notes: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          notes?: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity?: number
          subtotal: number
          unit_price: number
        }
        Update: {
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "delivery_products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          change_for: number | null
          confirmed_at: string | null
          coupon_code: string | null
          created_at: string
          customer_id: string
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          delivery_address_id: string | null
          delivery_address_text: string | null
          delivery_fee: number | null
          discount: number | null
          estimated_time: number | null
          id: string
          notes: string | null
          order_number: string
          order_type: string
          payment_method: string
          payment_status: string | null
          ready_at: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          change_for?: number | null
          confirmed_at?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_id: string
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          delivery_address_id?: string | null
          delivery_address_text?: string | null
          delivery_fee?: number | null
          discount?: number | null
          estimated_time?: number | null
          id?: string
          notes?: string | null
          order_number: string
          order_type?: string
          payment_method: string
          payment_status?: string | null
          ready_at?: string | null
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          change_for?: number | null
          confirmed_at?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_id?: string
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          delivery_address_id?: string | null
          delivery_address_text?: string | null
          delivery_fee?: number | null
          discount?: number | null
          estimated_time?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          order_type?: string
          payment_method?: string
          payment_status?: string | null
          ready_at?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "delivery_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "delivery_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_product_option_items: {
        Row: {
          id: string
          is_available: boolean | null
          name: string
          option_id: string
          order_position: number
          price_adjustment: number | null
        }
        Insert: {
          id?: string
          is_available?: boolean | null
          name: string
          option_id: string
          order_position?: number
          price_adjustment?: number | null
        }
        Update: {
          id?: string
          is_available?: boolean | null
          name?: string
          option_id?: string
          order_position?: number
          price_adjustment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_product_option_items_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "delivery_product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_product_options: {
        Row: {
          id: string
          is_required: boolean | null
          max_selections: number | null
          min_selections: number | null
          name: string
          order_position: number
          product_id: string
          type: string
        }
        Insert: {
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name: string
          order_position?: number
          product_id: string
          type?: string
        }
        Update: {
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name?: string
          order_position?: number
          product_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "delivery_products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_products: {
        Row: {
          base_price: number
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_featured: boolean | null
          name: string
          order_position: number
          preparation_time: number | null
          promotional_price: number | null
          serves: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price: number
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          name: string
          order_position?: number
          preparation_time?: number | null
          promotional_price?: number | null
          serves?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          name?: string
          order_position?: number
          preparation_time?: number | null
          promotional_price?: number | null
          serves?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "delivery_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "delivery_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_settings: {
        Row: {
          accepts_cash: boolean | null
          accepts_credit: boolean | null
          accepts_debit: boolean | null
          accepts_pix: boolean | null
          auto_accept_orders: boolean | null
          blocked_dates: Json | null
          business_hours: Json | null
          created_at: string
          default_delivery_fee: number | null
          delivery_zones: Json | null
          estimated_preparation_time: number | null
          google_tag_id: string | null
          id: string
          is_open: boolean | null
          max_delivery_distance: number | null
          meta_pixel_id: string | null
          min_order_value: number | null
          pix_key: string | null
          updated_at: string
          user_id: string
          whatsapp_notifications: boolean | null
        }
        Insert: {
          accepts_cash?: boolean | null
          accepts_credit?: boolean | null
          accepts_debit?: boolean | null
          accepts_pix?: boolean | null
          auto_accept_orders?: boolean | null
          blocked_dates?: Json | null
          business_hours?: Json | null
          created_at?: string
          default_delivery_fee?: number | null
          delivery_zones?: Json | null
          estimated_preparation_time?: number | null
          google_tag_id?: string | null
          id?: string
          is_open?: boolean | null
          max_delivery_distance?: number | null
          meta_pixel_id?: string | null
          min_order_value?: number | null
          pix_key?: string | null
          updated_at?: string
          user_id: string
          whatsapp_notifications?: boolean | null
        }
        Update: {
          accepts_cash?: boolean | null
          accepts_credit?: boolean | null
          accepts_debit?: boolean | null
          accepts_pix?: boolean | null
          auto_accept_orders?: boolean | null
          blocked_dates?: Json | null
          business_hours?: Json | null
          created_at?: string
          default_delivery_fee?: number | null
          delivery_zones?: Json | null
          estimated_preparation_time?: number | null
          google_tag_id?: string | null
          id?: string
          is_open?: boolean | null
          max_delivery_distance?: number | null
          meta_pixel_id?: string | null
          min_order_value?: number | null
          pix_key?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_notifications?: boolean | null
        }
        Relationships: []
      }
      evaluation_answers: {
        Row: {
          created_at: string
          evaluation_id: string
          id: string
          question_id: string
          score: number
        }
        Insert: {
          created_at?: string
          evaluation_id: string
          id?: string
          question_id: string
          score: number
        }
        Update: {
          created_at?: string
          evaluation_id?: string
          id?: string
          question_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "customer_evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "evaluation_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_questions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          order_position: number
          question_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          order_position?: number
          question_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          order_position?: number
          question_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_goals: {
        Row: {
          created_at: string | null
          id: string
          investment_goal: number | null
          month_year: string
          revenue_goal: number | null
          savings_goal: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          investment_goal?: number | null
          month_year: string
          revenue_goal?: number | null
          savings_goal?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          investment_goal?: number | null
          month_year?: string
          revenue_goal?: number | null
          savings_goal?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pdv_cash_closures: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          counted_cash: number | null
          counted_credit: number | null
          counted_debit: number | null
          counted_meal_voucher: number | null
          counted_pix: number | null
          created_at: string | null
          difference_cash: number | null
          difference_credit: number | null
          difference_debit: number | null
          difference_meal_voucher: number | null
          difference_pix: number | null
          expected_cash: number | null
          expected_credit: number | null
          expected_debit: number | null
          expected_meal_voucher: number | null
          expected_pix: number | null
          id: string
          notes: string | null
          shift: string
          shift_date: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          counted_cash?: number | null
          counted_credit?: number | null
          counted_debit?: number | null
          counted_meal_voucher?: number | null
          counted_pix?: number | null
          created_at?: string | null
          difference_cash?: number | null
          difference_credit?: number | null
          difference_debit?: number | null
          difference_meal_voucher?: number | null
          difference_pix?: number | null
          expected_cash?: number | null
          expected_credit?: number | null
          expected_debit?: number | null
          expected_meal_voucher?: number | null
          expected_pix?: number | null
          id?: string
          notes?: string | null
          shift: string
          shift_date: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          counted_cash?: number | null
          counted_credit?: number | null
          counted_debit?: number | null
          counted_meal_voucher?: number | null
          counted_pix?: number | null
          created_at?: string | null
          difference_cash?: number | null
          difference_credit?: number | null
          difference_debit?: number | null
          difference_meal_voucher?: number | null
          difference_pix?: number | null
          expected_cash?: number | null
          expected_credit?: number | null
          expected_debit?: number | null
          expected_meal_voucher?: number | null
          expected_pix?: number | null
          id?: string
          notes?: string | null
          shift?: string
          shift_date?: string
          user_id?: string
        }
        Relationships: []
      }
      pdv_cash_movements: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          handled_at: string | null
          handled_by: string | null
          id: string
          order_id: string | null
          payment_id: string | null
          payment_method: string | null
          shift: string | null
          shift_date: string
          type: Database["public"]["Enums"]["pdv_cash_movement_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          shift?: string | null
          shift_date: string
          type: Database["public"]["Enums"]["pdv_cash_movement_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          shift?: string | null
          shift_date?: string
          type?: Database["public"]["Enums"]["pdv_cash_movement_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_cash_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pdv_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_cash_movements_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "pdv_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_cashier_movements: {
        Row: {
          amount: number
          cashier_session_id: string
          created_at: string
          description: string | null
          id: string
          payment_method: string | null
          type: string
        }
        Insert: {
          amount: number
          cashier_session_id: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          type: string
        }
        Update: {
          amount?: number
          cashier_session_id?: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_cashier_movements_cashier_session_id_fkey"
            columns: ["cashier_session_id"]
            isOneToOne: false
            referencedRelation: "pdv_cashier_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_cashier_sessions: {
        Row: {
          closed_at: string | null
          closing_balance: number | null
          created_at: string
          id: string
          notes: string | null
          opened_at: string
          opening_balance: number
          total_card: number
          total_cash: number
          total_pix: number
          total_sales: number
          total_withdrawals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          total_card?: number
          total_cash?: number
          total_pix?: number
          total_sales?: number
          total_withdrawals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          total_card?: number
          total_cash?: number
          total_pix?: number
          total_sales?: number
          total_withdrawals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pdv_cmv_reports: {
        Row: {
          cmv_percentage: number | null
          created_at: string | null
          generated_at: string | null
          id: string
          period_end: string
          period_start: string
          product_margins: Json | null
          total_cmv: number | null
          total_revenue: number | null
          user_id: string
        }
        Insert: {
          cmv_percentage?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          period_end: string
          period_start: string
          product_margins?: Json | null
          total_cmv?: number | null
          total_revenue?: number | null
          user_id: string
        }
        Update: {
          cmv_percentage?: number | null
          created_at?: string | null
          generated_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          product_margins?: Json | null
          total_cmv?: number | null
          total_revenue?: number | null
          user_id?: string
        }
        Relationships: []
      }
      pdv_customers: {
        Row: {
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          last_visit: string | null
          name: string
          notes: string | null
          phone: string | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
          visit_count: number | null
        }
        Insert: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
          visit_count?: number | null
        }
        Update: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
          visit_count?: number | null
        }
        Relationships: []
      }
      pdv_ifood_products: {
        Row: {
          created_at: string | null
          id: string
          ifood_product_id: string | null
          ifood_sku: string | null
          last_synced_at: string | null
          pdv_product_id: string | null
          sync_enabled: boolean | null
          sync_error: string | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ifood_product_id?: string | null
          ifood_sku?: string | null
          last_synced_at?: string | null
          pdv_product_id?: string | null
          sync_enabled?: boolean | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ifood_product_id?: string | null
          ifood_sku?: string | null
          last_synced_at?: string | null
          pdv_product_id?: string | null
          sync_enabled?: boolean | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_ifood_products_pdv_product_id_fkey"
            columns: ["pdv_product_id"]
            isOneToOne: false
            referencedRelation: "pdv_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_ifood_sync_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          status: string
          sync_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: []
      }
      pdv_ifood_webhooks: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          payload: Json
          pdv_order_id: string | null
          processed: boolean | null
          processed_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type: string
          id?: string
          payload: Json
          pdv_order_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          payload?: Json
          pdv_order_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_ifood_webhooks_pdv_order_id_fkey"
            columns: ["pdv_order_id"]
            isOneToOne: false
            referencedRelation: "pdv_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_ingredients: {
        Row: {
          created_at: string | null
          current_stock: number | null
          expiration_date: string | null
          id: string
          min_stock: number | null
          name: string
          supplier_id: string | null
          unit: string
          unit_cost: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_stock?: number | null
          expiration_date?: string | null
          id?: string
          min_stock?: number | null
          name: string
          supplier_id?: string | null
          unit: string
          unit_cost: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_stock?: number | null
          expiration_date?: string | null
          id?: string
          min_stock?: number | null
          name?: string
          supplier_id?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_ingredients_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "pdv_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_order_items: {
        Row: {
          added_at: string | null
          added_by: string | null
          assigned_to_person: number | null
          created_at: string | null
          id: string
          kitchen_status: string | null
          modifiers: Json | null
          notes: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          ready_at: string | null
          sent_to_kitchen_at: string | null
          subtotal: number
          unit_price: number
          weight: number | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          assigned_to_person?: number | null
          created_at?: string | null
          id?: string
          kitchen_status?: string | null
          modifiers?: Json | null
          notes?: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity?: number
          ready_at?: string | null
          sent_to_kitchen_at?: string | null
          subtotal: number
          unit_price: number
          weight?: number | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          assigned_to_person?: number | null
          created_at?: string | null
          id?: string
          kitchen_status?: string | null
          modifiers?: Json | null
          notes?: string | null
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          ready_at?: string | null
          sent_to_kitchen_at?: string | null
          subtotal?: number
          unit_price?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pdv_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pdv_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pdv_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          closed_at: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          delivery_order_id: string | null
          discount: number | null
          id: string
          opened_at: string | null
          opened_by: string | null
          order_number: string
          paid_at: string | null
          service_fee: number | null
          source: string
          status: string
          subtotal: number | null
          table_id: string | null
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          delivery_order_id?: string | null
          discount?: number | null
          id?: string
          opened_at?: string | null
          opened_by?: string | null
          order_number: string
          paid_at?: string | null
          service_fee?: number | null
          source: string
          status?: string
          subtotal?: number | null
          table_id?: string | null
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          delivery_order_id?: string | null
          discount?: number | null
          id?: string
          opened_at?: string | null
          opened_by?: string | null
          order_number?: string
          paid_at?: string | null
          service_fee?: number | null
          source?: string
          status?: string
          subtotal?: number | null
          table_id?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "pdv_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_orders_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "pdv_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_payments: {
        Row: {
          amount: number
          authorization_code: string | null
          cash_received: number | null
          change_amount: number | null
          created_at: string | null
          id: string
          installments: number | null
          nsu: string | null
          order_id: string
          payment_method: string
          pix_txid: string | null
          processed_at: string | null
          processed_by: string | null
        }
        Insert: {
          amount: number
          authorization_code?: string | null
          cash_received?: number | null
          change_amount?: number | null
          created_at?: string | null
          id?: string
          installments?: number | null
          nsu?: string | null
          order_id: string
          payment_method: string
          pix_txid?: string | null
          processed_at?: string | null
          processed_by?: string | null
        }
        Update: {
          amount?: number
          authorization_code?: string | null
          cash_received?: number | null
          change_amount?: number | null
          created_at?: string | null
          id?: string
          installments?: number | null
          nsu?: string | null
          order_id?: string
          payment_method?: string
          pix_txid?: string | null
          processed_at?: string | null
          processed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdv_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pdv_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_product_modifiers: {
        Row: {
          affects_recipe: boolean | null
          created_at: string | null
          id: string
          is_available: boolean | null
          name: string
          price_adjustment: number | null
          product_id: string
        }
        Insert: {
          affects_recipe?: boolean | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          price_adjustment?: number | null
          product_id: string
        }
        Update: {
          affects_recipe?: boolean | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          price_adjustment?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pdv_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_product_recipes: {
        Row: {
          created_at: string | null
          id: string
          ingredient_id: string
          product_id: string
          quantity: number
          unit: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_id: string
          product_id: string
          quantity: number
          unit: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_id?: string
          product_id?: string
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_product_recipes_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "pdv_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_product_recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pdv_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_products: {
        Row: {
          available_times: Json | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_sold_by_weight: boolean | null
          name: string
          preparation_time: number | null
          price_balcao: number | null
          price_delivery: number | null
          price_salon: number
          serves: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_times?: Json | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_sold_by_weight?: boolean | null
          name: string
          preparation_time?: number | null
          price_balcao?: number | null
          price_delivery?: number | null
          price_salon: number
          serves?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_times?: Json | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_sold_by_weight?: boolean | null
          name?: string
          preparation_time?: number | null
          price_balcao?: number | null
          price_delivery?: number | null
          price_salon?: number
          serves?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pdv_settings: {
        Row: {
          accept_tips: boolean | null
          accepted_payment_methods: Json | null
          allow_negative_balance: boolean | null
          auto_print_to_kitchen: boolean | null
          business_address: string | null
          business_cnpj: string | null
          business_hours: Json | null
          business_name: string | null
          business_phone: string | null
          created_at: string | null
          default_preparation_time: number | null
          delivery_fee: number | null
          enable_desktop_notifications: boolean | null
          enable_multiple_payments: boolean | null
          enable_service_fee: boolean | null
          enable_sound_notifications: boolean | null
          id: string
          ifood_access_token: string | null
          ifood_auto_accept: boolean | null
          ifood_enabled: boolean | null
          ifood_merchant_id: string | null
          ifood_refresh_token: string | null
          ifood_sync_menu: boolean | null
          ifood_token_expires_at: string | null
          integrate_with_delivery: boolean | null
          max_tables_per_order: number | null
          min_order_value: number | null
          new_order_sound: string | null
          order_ready_sound: string | null
          printers: Json | null
          require_customer_identification: boolean | null
          requires_opening_balance: boolean | null
          salon_layout: Json | null
          service_fee_percentage: number | null
          shifts: Json | null
          state_registration: string | null
          tax_regime: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accept_tips?: boolean | null
          accepted_payment_methods?: Json | null
          allow_negative_balance?: boolean | null
          auto_print_to_kitchen?: boolean | null
          business_address?: string | null
          business_cnpj?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string | null
          default_preparation_time?: number | null
          delivery_fee?: number | null
          enable_desktop_notifications?: boolean | null
          enable_multiple_payments?: boolean | null
          enable_service_fee?: boolean | null
          enable_sound_notifications?: boolean | null
          id?: string
          ifood_access_token?: string | null
          ifood_auto_accept?: boolean | null
          ifood_enabled?: boolean | null
          ifood_merchant_id?: string | null
          ifood_refresh_token?: string | null
          ifood_sync_menu?: boolean | null
          ifood_token_expires_at?: string | null
          integrate_with_delivery?: boolean | null
          max_tables_per_order?: number | null
          min_order_value?: number | null
          new_order_sound?: string | null
          order_ready_sound?: string | null
          printers?: Json | null
          require_customer_identification?: boolean | null
          requires_opening_balance?: boolean | null
          salon_layout?: Json | null
          service_fee_percentage?: number | null
          shifts?: Json | null
          state_registration?: string | null
          tax_regime?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accept_tips?: boolean | null
          accepted_payment_methods?: Json | null
          allow_negative_balance?: boolean | null
          auto_print_to_kitchen?: boolean | null
          business_address?: string | null
          business_cnpj?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          created_at?: string | null
          default_preparation_time?: number | null
          delivery_fee?: number | null
          enable_desktop_notifications?: boolean | null
          enable_multiple_payments?: boolean | null
          enable_service_fee?: boolean | null
          enable_sound_notifications?: boolean | null
          id?: string
          ifood_access_token?: string | null
          ifood_auto_accept?: boolean | null
          ifood_enabled?: boolean | null
          ifood_merchant_id?: string | null
          ifood_refresh_token?: string | null
          ifood_sync_menu?: boolean | null
          ifood_token_expires_at?: string | null
          integrate_with_delivery?: boolean | null
          max_tables_per_order?: number | null
          min_order_value?: number | null
          new_order_sound?: string | null
          order_ready_sound?: string | null
          printers?: Json | null
          require_customer_identification?: boolean | null
          requires_opening_balance?: boolean | null
          salon_layout?: Json | null
          service_fee_percentage?: number | null
          shifts?: Json | null
          state_registration?: string | null
          tax_regime?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pdv_stock_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          ingredient_id: string
          order_item_id: string | null
          quantity: number
          reason: string | null
          type: Database["public"]["Enums"]["pdv_stock_movement_type"]
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ingredient_id: string
          order_item_id?: string | null
          quantity: number
          reason?: string | null
          type: Database["public"]["Enums"]["pdv_stock_movement_type"]
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          ingredient_id?: string
          order_item_id?: string | null
          quantity?: number
          reason?: string | null
          type?: Database["public"]["Enums"]["pdv_stock_movement_type"]
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pdv_stock_movements_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "pdv_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_stock_movements_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "pdv_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_suppliers: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      pdv_tables: {
        Row: {
          capacity: number
          created_at: string | null
          current_order_id: string | null
          id: string
          position_x: number | null
          position_y: number | null
          shape: string | null
          status: Database["public"]["Enums"]["pdv_table_status"] | null
          table_number: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          current_order_id?: string | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          shape?: string | null
          status?: Database["public"]["Enums"]["pdv_table_status"] | null
          table_number: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capacity?: number
          created_at?: string | null
          current_order_id?: string | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          shape?: string | null
          status?: Database["public"]["Enums"]["pdv_table_status"] | null
          table_number?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string | null
          document: string | null
          document_type: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          document?: string | null
          document_type?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          document?: string | null
          document_type?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          priority: string
          related_bill_id: string | null
          related_transaction_id: string | null
          start_time: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          priority?: string
          related_bill_id?: string | null
          related_transaction_id?: string | null
          start_time: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          priority?: string
          related_bill_id?: string | null
          related_transaction_id?: string | null
          start_time?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          credit_card_id: string | null
          description: string | null
          id: string
          is_recurring: boolean | null
          payment_method: string | null
          transaction_date: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          transaction_date: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          credit_card_id?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_modules: {
        Row: {
          acquired_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          module: Database["public"]["Enums"]["user_module"]
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          module: Database["public"]["Enums"]["user_module"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          module?: Database["public"]["Enums"]["user_module"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          currency: string | null
          date_format: string | null
          density: string | null
          financial_settings: Json | null
          id: string
          language: string | null
          notifications: Json | null
          nps_enabled: boolean | null
          security_settings: Json | null
          sidebar_expanded: boolean | null
          theme: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          density?: string | null
          financial_settings?: Json | null
          id?: string
          language?: string | null
          notifications?: Json | null
          nps_enabled?: boolean | null
          security_settings?: Json | null
          sidebar_expanded?: boolean | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          density?: string | null
          financial_settings?: Json | null
          id?: string
          language?: string | null
          notifications?: Json | null
          nps_enabled?: boolean | null
          security_settings?: Json | null
          sidebar_expanded?: boolean | null
          theme?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_module_access: {
        Args: {
          _module: Database["public"]["Enums"]["user_module"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      pdv_cash_movement_type:
        | "abertura"
        | "venda"
        | "sangria"
        | "suprimento"
        | "fechamento"
      pdv_stock_movement_type:
        | "entrada"
        | "saida_venda"
        | "saida_perda"
        | "ajuste"
      pdv_table_status:
        | "livre"
        | "ocupada"
        | "aguardando_pedido"
        | "aguardando_cozinha"
        | "pediu_conta"
        | "pendente_pagamento"
      user_module: "financeiro" | "crm" | "delivery" | "pdv" | "avaliacoes"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      pdv_cash_movement_type: [
        "abertura",
        "venda",
        "sangria",
        "suprimento",
        "fechamento",
      ],
      pdv_stock_movement_type: [
        "entrada",
        "saida_venda",
        "saida_perda",
        "ajuste",
      ],
      pdv_table_status: [
        "livre",
        "ocupada",
        "aguardando_pedido",
        "aguardando_cozinha",
        "pediu_conta",
        "pendente_pagamento",
      ],
      user_module: ["financeiro", "crm", "delivery", "pdv", "avaliacoes"],
    },
  },
} as const
