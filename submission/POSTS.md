# Social posts

Handles below are written as the event page listed them. Check each one resolves before posting;
I did not verify them against X itself.

---

## X post, fits the 280 limit  (paste as one block)

Almost every tool in this space assumes you can email a bank about a death. You cannot.

Kin reads each organisation's own page and works out the channel they take. Of 7 read, 1 accepts email.

@convex @OpenAI @firecrawl @agentmail
https://acrobatic-condor-542.convex.site

---

## X post, longer version  (only if you have Premium, 384 characters)

When someone dies, one person has to tell 20 or 30 organisations. Almost every tool in this space assumes you can email a bank about it. You cannot.

Kin reads each organisation's own page and works out which channel they actually take. Of the 7 it has read, 1 accepts email.

Built for All Gas on @convex with @OpenAI, @firecrawl, @agentmail

https://acrobatic-condor-542.convex.site

---

## LinkedIn post

When someone dies, one person has to tell twenty or thirty organisations. Five are banks and pensions. The rest are the phone carrier, the gym, the storage unit, the dentist, the employer's HR. Each wants something different, and most will not tell you what until you have waited on hold.

I built Kin for the Convex All Gas Hackathon.

You type an organisation's name. Firecrawl finds that organisation's own bereavement page, not a forum thread that reads like policy. OpenAI pulls out what they require. Then every contact fact is checked back against the page before it is stored, and anything the model produced that is not literally on that page is dropped and named on the card.

The test is one string. Wells Fargo's postal address carries an internal mail code, D1118-02D, that exists on their page and nowhere else. Search the repository and you will not find it. If a model guessed that line, a certified death certificate would go nowhere.

The part most products get wrong is assuming a bank will take an email. Wells Fargo will not. Neither will Chase. Of the seven organisations Kin has read, one accepts email. So detecting the channel is the product, not a limitation to route around. Where email is not accepted, Kin produces the postal packet instead and still catches the reply.

One thing I will say plainly: the send path has not been run end to end, because no organisation I have tested accepts email yet. That is written on the live site too.

Built on Convex with Firecrawl, OpenAI and AgentMail.

https://acrobatic-condor-542.convex.site
