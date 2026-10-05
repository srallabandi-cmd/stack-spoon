# Human-touch explainer - VO script (~55-65s)

**Tone:** Warm, conversational, a little playful - talking to a friend, not a press release.  
**Voice:** `en-US-AvaNeural` via edge-tts (rate +10%, pitch +3Hz) - expressive / caring / friendly.  
**Music:** Fun upbeat bed (`assets/music/fun-bed.mp3`, SoundHelix Song 8), ducked under VO.  
**Build:** `scripts/rebuild_fun_audio.sh` → `web/public/brand/explainer.mp4`

---

## Full VO

> Hey - you weren't meant to carry the whole stack alone.
>
> Every morning: tools that don't talk, a calendar that never sleeps, and an A.I. that forgets you by lunch.
>
> What if something actually remembered with you?
>
> What if an agent met you where you work - and you still kept your hand on the wheel?
>
> Pick how you show up. Product. Program. Finance. Your role. Your pack.
>
> Connect Slack, calendar, meetings - one friendly click. No jargon. No terminal.
>
> Agents draft. You decide. Approve what feels right.
>
> Monday morning, your brief is waiting - decisions, priorities, room to breathe.
>
> Stack Spoon. We don't replace your judgment. We hold it with care. Start with your role.

---

## Landing interaction

Browsers block unmuted autoplay. Hero player:
1. Soft autoplay **muted**
2. Pulsing **“Hear the story”** invite
3. Click → unmute + play with VO/music
