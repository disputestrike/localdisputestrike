            </CardTitle>
            <CardDescription className="text-gray-500">
              Your latest dispute actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <activity.icon className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No activity yet</p>
                  <p className="text-xs text-gray-400">Upload credit reports to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Your Credit Repair Journey
          </CardTitle>
          <CardDescription className="text-gray-500">
            Follow these steps to maximize your credit score improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: 1, title: "Upload Reports", desc: "Get your 3-bureau credit reports", done: (creditReports?.length || 0) > 0 },
              { step: 2, title: "Review Accounts", desc: "Identify negative items to dispute", done: totalAccounts > 0 },
              { step: 3, title: "Generate Letters", desc: "Create AI-powered dispute letters", done: (stats?.totalLetters || 0) > 0 },
              { step: 4, title: "Mail & Track", desc: "Send letters and monitor responses", done: pendingDisputes > 0 },
            ].map((item) => (
              <div
                key={item.step}
                className={`p-4 rounded-lg border ${
                  item.done
                    ? "bg-orange-50 border-orange-300"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.done
                        ? "bg-cyan-500 text-gray-900"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="h-4 w-4" /> : item.step}
                  </div>
                  <span className={`font-medium ${item.done ? "text-orange-500" : "text-gray-900"}`}>
                    {item.title}
                  </span>