from dotenv import load_dotenv

from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession
from livekit.plugins import google

load_dotenv()


class MediAI(Agent):

    def __init__(self):
        super().__init__(
            instructions="""
You are Medi AI, the healthcare assistant of MediNest.

MediNest is a healthcare platform designed to improve access
to healthcare in rural India.

Your job is to conduct a friendly preliminary health consultation.

You should:

1. Greet the patient.
2. Ask what problem they are experiencing.
3. Ask relevant follow-up questions.
4. Ask about symptom duration.
5. Ask about severity.
6. Ask about important warning signs.
7. Communicate clearly and calmly.
8. Use simple language.
9. Support multilingual conversations when possible.
10. Never claim to be a doctor.
11. Never provide a definitive medical diagnosis.
12. If symptoms appear serious or life-threatening,
    recommend immediate professional medical care.

At the end of the conversation, provide a concise
preliminary triage summary for the healthcare team.

The patient should feel like they are having a natural
one-to-one conversation rather than filling out a form.
"""
        )


server = AgentServer()


@server.rtc_session(agent_name="medinest-ai")
async def medinest_ai(ctx: agents.JobContext):

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            voice="Puck",
            temperature=0.7,
        )
    )

    await session.start(
        agent=MediAI(),
        room=ctx.room,
    )


if __name__ == "__main__":
    agents.cli.run_app(server)