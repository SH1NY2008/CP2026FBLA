import { IconTrendingUp, IconBuildingStore, IconMessageStar, IconStar, IconTag } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  totalBusinesses: number
  totalReviews: number
  averageRating: number
  activeDeals: number
}

export function SectionCards({ 
  totalBusinesses = 0, 
  totalReviews = 0, 
  averageRating = 0, 
  activeDeals = 0 
}: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Businesses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalBusinesses}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBuildingStore className="mr-1 size-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Local partners <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Registered on platform
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Reviews</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalReviews}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconMessageStar className="mr-1 size-3" />
              Feedback
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Community engagement <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Customer interactions
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average Rating</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {averageRating.toFixed(1)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconStar className="mr-1 size-3" />
              Score
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Quality metric <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Overall satisfaction</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Deals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeDeals}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTag className="mr-1 size-3" />
              Offers
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Current promotions <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Live opportunities</div>
        </CardFooter>
      </Card>
    </div>
  )
}
