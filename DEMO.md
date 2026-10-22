# ECHO presentation and rehearsal

## Suggested four-person presentation

These are proposed responsibilities, not a claim about who wrote the generated source. Each member should understand and adapt their part before presenting.

**Sudip — introduce the idea and rules (45 seconds).**
“ECHO is a time-loop puzzle. You cannot reach the tram while holding the gate and powering it yourself. Each rewind leaves a recording of your actions, so you gradually become your own team. The engine is a pure JavaScript module shared between solo mode and our multiplayer server.”

**Sondor — show the city and interaction (45 seconds).**
“The city is drawn in Canvas 2D using an perspective projection. We create depth by sorting objects by ground position. The interface explains the current mission and shows contextual interaction prompts. You can use keys, click pathfinding, or touch controls.”

**Eric — demonstrate the echoes and multiplayer (60 seconds).**
“We record time-stamped positions and interpolate between samples for smooth replay. An echo remains at its final position, so we can assign it a useful job. Our Node server supports four players and sends shared game state through Server-Sent Events. The host controls resets; the server validates movement and actions.”

**Abinash — explain persistence, testing, and limitations (45 seconds).**
“Solo progress is saved in localStorage. Multiplayer rooms are temporary in-memory sessions, so no database subscription is needed. We test the full three-loop solution, collisions, replay interpolation, deadlines, four-person roles, and real HTTP authorization. We also need to rehearse on the presentation Wi-Fi because networks sometimes isolate devices.”

## Reliable solo walkthrough — spoilers

1. Enter the loop. Move to the **ticket kiosk** on the left, near the road above the start. Press E.
2. Walk to the **amber I pad**, below and left of the bridge. Stand in the centre until it lights up. Press R.
3. On loop 2, walk to the bridge approach. Wait for your echo to reach pad I. Cross the canal at the centre bridge.
4. Walk to the **blue II power pad** on the lower right. Stand in its centre and press R.
5. On loop 3, cross the bridge after your first echo opens it. Walk to the tram platform on the upper right. Your second echo will eventually reach pad II and restore power. Press E near the tram before the last five seconds.
6. Show the ending, save the journey JSON, or inspect the echo timeline.

If click-to-walk reports no route, the gate is closed or the destination is inside a building. Wait for the gate echo and click an open patch of ground. A fast first recording makes later loops easier. Use fresh-start confirmation to rehearse again.

## Co-op demo

Start one Node server and join with four different characters from separate browser tabs or devices. Each tab has its own room session. Have one player hold pad I, another hold pad II, a third collect the ticket, and the fourth board. The host can rewind after 1 second to show all four ghosts at once. Keep everyone’s game open and do not refresh mid-room; rejoining an existing player session is not implemented.

## Technical questions to prepare

- Why timestamped samples instead of storing every animation frame? Sampling makes replays smaller and independent of rendering speed; interpolation makes motion smooth.
- Why share the engine? Solo mode and multiplayer follow identical collision, timing, replay, and victory rules.
- What is authoritative online? Server clock, positions, collision checks, inventory, echoes, and victory. Clients submit movement intentions and actions.
- What survives a reset? Ticket, story memories, and previous echoes. Positions, current recording, and loop timer reset.
- What persists after a restart? Browser solo saves persist. Server rooms do not.
- What would you improve? Reconnectable multiplayer sessions, more chapters, accessibility alternatives to the spatial map, and a durable room store if required.
