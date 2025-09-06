import requests
import os
import base64
import json
from datetime import datetime
import hashlib

# Example: DALL·E 3 API integration (replace with actual API endpoint and key)
DALLE_API_URL = os.getenv('DALLE_API_URL', 'https://api.openai.com/v1/images/generations')
DALLE_API_KEY = os.getenv('DALLE_API_KEY', 'your_openai_api_key')

# Example: Stable Diffusion API integration (replace with actual API endpoint and key)
SD_API_URL = os.getenv('SD_API_URL', 'https://api.stablediffusionapi.com/v3/text2img')
SD_API_KEY = os.getenv('SD_API_KEY', 'your_sd_api_key')

# Example: Pika Labs API integration (replace with actual API endpoint and key)
PIKA_API_URL = os.getenv('PIKA_API_URL', 'https://api.pikalabs.com/v1/video/generate')
PIKA_API_KEY = os.getenv('PIKA_API_KEY', 'your_pika_api_key')

# Example: Synthesia API integration (replace with actual API endpoint and key)
SYNTHESIA_API_URL = os.getenv('SYNTHESIA_API_URL', 'https://api.synthesia.io/v1/videos')
SYNTHESIA_API_KEY = os.getenv('SYNTHESIA_API_KEY', 'your_synthesia_api_key')

def generate_dalle_image(prompt, user_context=None):
    """Generate image using DALL·E 3 with enhanced error handling"""
    try:
        headers = {
            'Authorization': f'Bearer {DALLE_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Enhance prompt with user context
        if user_context:
            enhanced_prompt = f"Professional lifestyle image: {prompt}. Person aged {user_context.get('age', 25)}, working as {user_context.get('dreamCareer', 'professional')}, high quality, realistic"
        else:
            enhanced_prompt = f"Professional lifestyle image: {prompt}, high quality, realistic"
        
        data = {
            'model': 'dall-e-3',
            'prompt': enhanced_prompt[:1000],  # Limit prompt length
            'n': 1,
            'size': '1024x1024',
            'quality': 'standard'
        }
        
        response = requests.post(DALLE_API_URL, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'image_url': result['data'][0]['url'],
                'prompt_used': enhanced_prompt,
                'timestamp': datetime.now().isoformat(),
                'model': 'dall-e-3'
            }
        else:
            print(f"DALL·E API error: {response.status_code} - {response.text}")
            return generate_fallback_image(prompt, user_context)
            
    except Exception as e:
        print(f"DALL·E generation failed: {e}")
        return generate_fallback_image(prompt, user_context)

def generate_sd_image(prompt, user_context=None):
    """Generate image using Stable Diffusion with enhanced error handling"""
    try:
        headers = {
            'Authorization': f'Bearer {SD_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        if user_context:
            enhanced_prompt = f"{prompt}, person aged {user_context.get('age', 25)}, {user_context.get('dreamCareer', 'professional')} setting"
        else:
            enhanced_prompt = prompt
        
        data = {
            'prompt': enhanced_prompt,
            'width': 1024,
            'height': 1024,
            'samples': 1
        }
        
        response = requests.post(SD_API_URL, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'image_url': result.get('output', [None])[0],
                'prompt_used': enhanced_prompt,
                'timestamp': datetime.now().isoformat(),
                'model': 'stable-diffusion'
            }
        else:
            return generate_fallback_image(prompt, user_context)
            
    except Exception as e:
        print(f"Stable Diffusion generation failed: {e}")
        return generate_fallback_image(prompt, user_context)

def generate_pika_video(prompt, user_context=None):
    """Generate video using Pika Labs with enhanced error handling"""
    try:
        headers = {
            'Authorization': f'Bearer {PIKA_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        if user_context:
            enhanced_prompt = f"{prompt}, featuring {user_context.get('name', 'person')} in {user_context.get('dreamCareer', 'professional')} environment"
        else:
            enhanced_prompt = prompt
        
        data = {
            'prompt': enhanced_prompt,
            'duration': 10,
            'aspect_ratio': '16:9'
        }
        
        response = requests.post(PIKA_API_URL, headers=headers, json=data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'video_url': result.get('video_url'),
                'prompt_used': enhanced_prompt,
                'timestamp': datetime.now().isoformat(),
                'duration': 10,
                'model': 'pika-labs'
            }
        else:
            return generate_fallback_video(prompt, user_context)
            
    except Exception as e:
        print(f"Pika Labs generation failed: {e}")
        return generate_fallback_video(prompt, user_context)

def generate_synthesia_video(script, user_context=None):
    """Generate video using Synthesia with enhanced error handling"""
    try:
        headers = {
            'Authorization': f'Bearer {SYNTHESIA_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'script': script[:1000],  # Limit script length
            'avatar': user_context.get('avatar_style', 'default') if user_context else 'default',
            'output_format': 'mp4',
            'voice': 'neutral'
        }
        
        response = requests.post(SYNTHESIA_API_URL, headers=headers, json=data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'video_url': result.get('video_url'),
                'script_used': script,
                'timestamp': datetime.now().isoformat(),
                'model': 'synthesia'
            }
        else:
            return generate_fallback_video(script, user_context)
            
    except Exception as e:
        print(f"Synthesia generation failed: {e}")
        return generate_fallback_video(script, user_context)

def generate_fallback_image(prompt, user_context=None):
    """Generate fallback placeholder image"""
    # Create a unique seed based on prompt and user context
    seed = hash(f"{prompt}_{user_context.get('name', 'user') if user_context else 'default'}") % 1000
    
    # Use different placeholder services for variety
    placeholder_services = [
        f"https://picsum.photos/seed/{seed}/1024/1024",
        f"https://source.unsplash.com/1024x1024/?professional,office,{user_context.get('dreamCareer', 'career') if user_context else 'business'}",
        f"https://via.placeholder.com/1024x1024/2c2d31/ffffff?text=Future+You"
    ]
    
    return {
        'success': True,
        'image_url': placeholder_services[seed % len(placeholder_services)],
        'prompt_used': prompt,
        'timestamp': datetime.now().isoformat(),
        'fallback': True,
        'message': 'Using placeholder image - AI generation temporarily unavailable'
    }

def generate_fallback_video(prompt, user_context=None):
    """Generate fallback video response"""
    return {
        'success': True,
        'video_script': f"""
🎬 Your Life Movie: "{user_context.get('name', 'Your')} Journey to Success"

Scene 1: Present Day
{user_context.get('name', 'You')} at age {user_context.get('age', 25)}, currently working in {user_context.get('currentCareer', 'your current field')}.

Scene 2: The Decision
A moment of clarity - the decision to pursue {user_context.get('dreamCareer', 'your dream career')}.

Scene 3: The Journey
Through dedication, learning, and perseverance, skills are built and connections made.

Scene 4: Success
{user_context.get('name', 'You')} thriving as a successful {user_context.get('dreamCareer', 'professional')}, making a real impact.

🎯 This is your potential future - make it reality!
        """,
        'prompt_used': prompt,
        'timestamp': datetime.now().isoformat(),
        'fallback': True,
        'message': 'Video generation temporarily unavailable - generated script instead'
    }

def generate_life_movie(scenarios, user_data):
    """Create a comprehensive 'life movie' combining multiple scenarios"""
    name = user_data.get('name', 'User')
    current_career = user_data.get('currentCareer', 'Current Role')
    dream_career = user_data.get('dreamCareer', 'Dream Role')
    age = user_data.get('age', 25)
    
    movie_script = f"""
🎬 LIFE MOVIE: "{name}'s Parallel Journey"
Runtime: 3-4 minutes | Genre: Inspirational Biography

═══════════════════════════════════════════

OPENING CREDITS
"Every choice creates a new timeline. Every dream has a path."

SCENE 1: PRESENT DAY [Age {age}]
{name} wakes up, goes to work as a {current_career}. 
There's a spark in their eyes - a dream waiting to unfold.

SCENE 2: THE CROSSROADS
A pivotal moment of decision. The choice to pursue {dream_career}.
"What if I took that leap? What would my life become?"

SCENE 3: TRANSFORMATION MONTAGE
- Learning new skills late into the night
- Networking with industry professionals  
- Building projects and gaining experience
- Overcoming setbacks with determination

SCENE 4: BREAKTHROUGH
The first major success in the {dream_career} field.
Recognition, achievement, the beginning of true fulfillment.

SCENE 5: MASTERY [5 Years Later]
{name} now thriving as a respected {dream_career}.
Making an impact, mentoring others, living the dream.

CLOSING CREDITS
"Your parallel life is waiting. The choice is yours."

═══════════════════════════════════════════

🎭 Cast: {name} (Starring as themselves)
🎵 Soundtrack: "Journey to Success" - Original Score
📱 Behind the Scenes: Powered by Parallel You AI
    """
    
    return {
        'success': True,
        'movie_script': movie_script,
        'duration': '3-4 minutes',
        'scenes': 5,
        'timestamp': datetime.now().isoformat(),
        'genre': 'Inspirational Biography',
        'rating': 'Everyone - Suitable for all audiences'
    }

def generate_avatar_image(user_data):
    """Generate a personalized avatar image"""
    try:
        prompt = f"Professional headshot of a {user_data.get('age', 25)} year old person, working as {user_data.get('dreamCareer', 'professional')}, confident, successful, high quality portrait"
        return generate_dalle_image(prompt, user_data)
    except Exception as e:
        return generate_fallback_image("professional avatar", user_data)

def create_vision_board(user_data, goals):
    """Create a vision board with user goals and aspirations"""
    vision_elements = []
    
    # Career visualization
    if user_data.get('dreamCareer'):
        vision_elements.append(f"🎯 Career: {user_data['dreamCareer']}")
    
    # Personal goals
    for goal in goals.get('personal', []):
        vision_elements.append(f"✨ {goal}")
    
    # Professional goals  
    for goal in goals.get('professional', []):
        vision_elements.append(f"🚀 {goal}")
    
    vision_board = f"""
🌟 VISION BOARD: {user_data.get('name', 'Your')} Future Self

{chr(10).join(vision_elements)}

📅 Target Timeline: Next 2-5 years
💪 Success Probability: {user_data.get('score', 75)}%
🎨 Generated: {datetime.now().strftime('%B %d, %Y')}
    """
    
    return {
        'success': True,
        'vision_board': vision_board,
        'elements_count': len(vision_elements),
        'timestamp': datetime.now().isoformat()
    }
